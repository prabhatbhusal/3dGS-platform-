const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory stores (replace with DB in production)
const users = [];
const messages = [];

app.get("/", (req, res) => {
  res.send("Hello, Express! Backend API is up.");
});

app.get("/api/status", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Users
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const user = { id: users.length + 1, name };
  users.push(user);
  res.status(201).json(user);
});

// Messages
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { from, text } = req.body;
  if (!from || !text) return res.status(400).json({ error: "from and text required" });
  const msg = { id: messages.length + 1, from, text, createdAt: Date.now() };
  messages.push(msg);
  res.status(201).json(msg);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;