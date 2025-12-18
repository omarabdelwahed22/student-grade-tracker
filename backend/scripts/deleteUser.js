const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const User = require('../models/userModel')

async function main() {
  const arg = process.argv.slice(2).join(' ')
  if (!arg) {
    console.log('Usage: node scripts/deleteUser.js <email|studentId>')
    process.exit(1)
  }

  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('MONGO_URI not set')
    process.exit(1)
  }

  await mongoose.connect(uri)
  let filter
  if (/^\d{9}$/.test(arg)) filter = { studentId: arg.toUpperCase() }
  else filter = { email: arg.toLowerCase() }

  const res = await User.findOneAndDelete(filter)
  if (res) console.log('Deleted:', { id: res._id.toString(), email: res.email, studentId: res.studentId })
  else console.log('No matching user found for', filter)

  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
