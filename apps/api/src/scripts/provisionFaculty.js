import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import argon2 from 'argon2';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function provisionFaculty() {
  const args = process.argv.slice(2);
  const email = args[0]?.toLowerCase().trim();
  const name = args[1]?.trim();
  const password = args[2];

  if (!email || !name || !password) {
    console.error('Usage: node apps/api/src/scripts/provisionFaculty.js <faculty_email> "<faculty_full_name>" "<initial_password>"');
    console.error('Example: node apps/api/src/scripts/provisionFaculty.js dr.sharma@university.edu "Dr. R. Sharma" "SecurePass123!"');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: Initial password must be at least 8 characters.');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await argon2.hash(password);
  const avatar = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.role = 'faculty';
    existing.passwordHash = passwordHash;
    existing.avatar = avatar;
    await existing.save();
    console.log(`[Provisioning] Existing account updated to Faculty Reviewer: ${name} (${email})`);
  } else {
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'faculty',
      avatar,
      bio: 'Institutional Faculty Reviewer',
    });
    console.log(`[Provisioning] New Faculty Reviewer successfully provisioned: ${user.name} (${user.email}), Role: ${user.role}`);
  }

  await closeDB();
}

provisionFaculty().catch((err) => {
  console.error('[Provisioning Error]:', err.message);
  process.exit(1);
});
