const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Logging and rate-limiting for production readiness
const pino = require('pino')();
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Basic rate limiter: tuned conservatively, can be replaced with Redis-backed limiter for scale
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.use(cors());
app.use(express.json());

// ensure uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const upload = multer({ dest: uploadsDir });

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "7d" });
}

async function getUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2) return null;
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user;
  } catch (e) {
    return null;
  }
}

async function audit({ userId = null, action, meta = null, ip = null }) {
  try {
    await prisma.auditLog.create({ data: { userId, action, meta, ip } });
  } catch (e) {
    pino.error('audit failed', e);
  }
}

app.get("/", (req, res) => {
  res.send("Hello, Express! Backend API is up.");
});

const sampleProjects = [
  { id: 1, name: 'Madan Ashrit College', details: '21 scenes · 17 doorways · published 28 Jul', status: 'live' },
  { id: 2, name: 'Patan Durbar — courtyards', details: '6 scenes · heritage', status: 'live' },
  { id: 3, name: 'Kirtipur campus', details: '3 scenes · capture in progress', status: 'draft' },
  { id: 4, name: 'New project', details: 'start from an LCC file', status: 'draft' },
]

app.get("/api/status", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get('/api/projects', async (req, res) => {
  const user = await getUserFromToken(req)
  if (!user) return res.status(401).json({ error: 'unauthorized' })
  res.json(sampleProjects)
})

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, org } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "name, email and password required" });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "email already registered" });
    const hash = await bcrypt.hash(password, 10);
    let organization = null;
    if (org) {
      organization = await prisma.organization.upsert({ where: { name: org }, update: {}, create: { name: org } });
    }
    const user = await prisma.user.create({ data: { name, email, password: hash, organizationId: organization ? organization.id : undefined } });
    const token = signToken(user);
    const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    await audit({ userId: user.id, action: 'register', meta: { email }, ip: req.ip });
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// File upload (authenticated)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'file required' });
  try {
    const projectId = req.body.projectId ? Number(req.body.projectId) : null;
    const url = `/uploads/${path.basename(req.file.path)}`;
    await audit({
      userId: user.id,
      action: 'upload_file',
      meta: { originalName: req.file.originalname, size: req.file.size, projectId },
      ip: req.ip,
    });
    res.json({ url, originalName: req.file.originalname, projectId });
  } catch (e) {
    pino.error(e);
    res.status(500).json({ error: 'upload failed' });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = signToken(user);
    const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    await audit({ userId: user.id, action: 'login', meta: { email }, ip: req.ip });
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Protected route example
app.get("/api/users/me", async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  await audit({ userId: user.id, action: 'get_profile', ip: req.ip });
  res.json(safeUser);
});

// Users (admin/list)
app.get("/api/users", async (req, res) => {
  // admin-only listing
  const caller = await getUserFromToken(req);
  if (!caller || caller.role !== 'ADMIN') return res.status(403).json({ error: 'forbidden' });
  const list = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  await audit({ userId: caller.id, action: 'list_users', ip: req.ip });
  res.json(list);
});

// Messages
app.get("/api/messages", async (req, res) => {
  const list = await prisma.message.findMany({ orderBy: { createdAt: 'asc' }, include: { from: true } });
  const mapped = list.map(m => ({ id: m.id, from: m.from.name, text: m.text, createdAt: m.createdAt }));
  res.json(mapped);
});

app.post("/api/messages", async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });
  try {
    const msg = await prisma.message.create({ data: { fromId: user.id, text } });
    await audit({ userId: user.id, action: 'create_message', meta: { text: text.slice(0,200) }, ip: req.ip });
    res.status(201).json({ id: msg.id, from: user.name, text: msg.text, createdAt: msg.createdAt });
  } catch (err) {
    pino.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;