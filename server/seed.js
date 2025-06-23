// Run this script once to add initial users
const db = require('./db');

async function seed() {
    try {
        await db.addUser('admin', 'admin', 'admin');
        await db.addUser('student1', 'studentpass', 'student');
        await db.addUser('staff1', 'staffpass', 'staff');
        console.log('Users seeded!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
