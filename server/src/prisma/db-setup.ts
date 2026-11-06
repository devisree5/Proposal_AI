import { execSync } from 'child_process';
import { seedCatalog } from './seed.js';

async function setup() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

  const schemaFile = isPostgres ? 'src/prisma/schema.postgresql.prisma' : 'src/prisma/schema.prisma';
  console.log(`Setting up database using schema: ${schemaFile} (PostgreSQL: ${isPostgres})`);

  try {
    execSync(`npx prisma db push --schema ${schemaFile} --accept-data-loss`, {
      stdio: 'inherit',
    });
    console.log('Database schema push succeeded.');

    await seedCatalog();
    console.log('Database setup and catalog seeding complete.');
  } catch (err: any) {
    console.error('Database setup error:', err);
    process.exit(1);
  }
}

setup();
