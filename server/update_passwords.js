const db = require('./db')
const bcrypt = require('bcryptjs')

console.log('🔄 Updating all student passwords to format: first4name + last4roll ...')

const students = db.prepare(`
    SELECT u.id as user_id, u.name, u.email, s.roll_no 
    FROM students s
    JOIN users u ON u.id = s.user_id
`).all()

let updated = 0
let errors = 0

const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')

students.forEach(s => {
    try {
        // format: first 4 letters of name (lowercase) + last 4 digits of roll_no
        // Example: Arjun Sharma, CS21001 -> arju1001

        let namePart = s.name.trim().split(' ')[0].toLowerCase()
        if (namePart.length > 4) namePart = namePart.substring(0, 4)

        // Handle short names (pad with 'x'?) or just use what we have? 
        // User said "first four letters". If name is "Jo", "jo" is all we have. 
        // I will just use the name as is if < 4.

        let rollPart = s.roll_no.trim()
        if (rollPart.length > 4) rollPart = rollPart.substring(rollPart.length - 4)

        const newPassword = `${namePart}${rollPart}`
        const hash = bcrypt.hashSync(newPassword, 10)

        updateStmt.run(hash, s.user_id)
        updated++

        // Log a few examples
        if (updated <= 5) {
            console.log(`   User: ${s.email} | Name: ${s.name} | Roll: ${s.roll_no}`)
            console.log(`   -> New Password: ${newPassword}`)
        }
    } catch (e) {
        console.error(`Error updating ${s.email}:`, e.message)
        errors++
    }
})

console.log(`\n✅ Updated ${updated} students. Errors: ${errors}`)
