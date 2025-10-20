import { prisma } from '../../src/utils/prisma';
import { execSync } from 'node:child_process';
import { Prisma } from '@prisma/client';

process.env.NODE_ENV = 'test';
process.env.SKIP_REDIS = '1';
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

let schemaReady = false;

async function tableHasColumn(table: string, column: string): Promise<boolean> {
  try {
    const r: Array<{ exists: boolean }> = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE LOWER(table_name) = LOWER($1) AND LOWER(column_name) = LOWER($2)
       ) as "exists";`,
      table, column
    );
    return r?.[0]?.exists === true;
  } catch {
    return false;
  }
}

async function ensureSchema() {
  if (schemaReady) return;
  const usingTestDb = !!process.env.DATABASE_URL_TEST;
  try {
    // Always try a trivial query first (ensures connectivity)
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error('Database connectivity failed for tests. Set DATABASE_URL_TEST.', e);
    throw e;
  }

  // We require newer columns (supplierId on Item, reorderLevel, etc.). Probe for one representative column.
  const hasSupplierId = await tableHasColumn('Item', 'supplierId');
  const hasReorderLevel = await tableHasColumn('Item', 'reorderLevel');
  const needsSync = !(hasSupplierId && hasReorderLevel);

  if (!needsSync) {
    schemaReady = true;
    return;
  }

  // Prefer migrate deploy if using dedicated test DB, else attempt a non-destructive db push fallback.
  if (usingTestDb) {
    try {
      console.info('[tests] Applying migrations (deploy) for test DB...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (e) {
      console.warn('[tests] migrate deploy failed, attempting db push fallback', e instanceof Error ? e.message : e);
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    }
  } else {
    console.warn('[tests] Shared DB missing new columns. Attempting prisma db push (consider using DATABASE_URL_TEST).');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (e) {
      console.error('[tests] prisma db push failed. Cannot proceed without schema sync.', e);
      throw e;
    }
  }

  schemaReady = true;
}

beforeAll(async () => {
  await ensureSchema();
});

afterEach(async () => {
  // Truncate data in reverse dependency order.
  // NOTE: InvitationToken model maps to table "InvitationToken" (adjusted from previous incorrect name).
  const tables = [
    'Notification',
    'InventoryLog',
    'ShipmentEvent',
    'OrderItem',
    'Shipment',
    'Order',
    'Item',
    'InvitationToken',
    'User',
    'Supplier',
    'Category'
  ];
  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`);
    } catch (e) {
      // swallow if table not present (older schema) to avoid noisy logs
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
