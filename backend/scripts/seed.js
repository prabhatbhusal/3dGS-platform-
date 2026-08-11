const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

dotenv.config()

const prisma = new PrismaClient()

async function main(){
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpass'
  const adminName = process.env.ADMIN_NAME || 'Administrator'

  // ensure organization
  const orgName = process.env.ADMIN_ORG || 'Default Org'
  let org = await prisma.organization.findUnique({ where: { name: orgName } })
  if (!org) org = await prisma.organization.create({ data: { name: orgName } })

  // create admin user if not exists
  let user = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!user) {
    const hash = await bcrypt.hash(adminPassword, 10)
    user = await prisma.user.create({ data: { name: adminName, email: adminEmail, password: hash, role: 'ADMIN', organizationId: org.id } })
    console.log('Created admin user:', adminEmail)
  } else {
    console.log('Admin already exists:', adminEmail)
  }
}

main().then(()=>{ console.log('Seed complete'); process.exit(0) }).catch(e=>{ console.error(e); process.exit(1) })
