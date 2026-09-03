import { seedDevelopmentDatabase } from './dev';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
  try {
    await seedDevelopmentDatabase();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database seed error:', err);
    process.exit(1);
  }
}

main();
