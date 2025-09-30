import { prisma } from '../utils/prisma';
import fs from 'fs';
import path from 'path';

async function setupTriggers() {
  try {
    // Create low stock function
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION check_low_stock()
      RETURNS TRIGGER AS $$
      DECLARE
          threshold_value INTEGER;
          existing_alert_count INTEGER;
      BEGIN
          SELECT COALESCE(value::INTEGER, 10) INTO threshold_value
          FROM "SystemSetting" 
          WHERE key = 'lowStockThreshold';
          
          IF NEW.quantity <= threshold_value THEN
              SELECT COUNT(*) INTO existing_alert_count
              FROM "Alert"
              WHERE "itemId" = NEW.id 
              AND type = 'LOW_STOCK' 
              AND acknowledged = false;
              
              IF existing_alert_count = 0 THEN
                  INSERT INTO "Alert" (id, type, message, "itemId", severity, acknowledged, "createdAt")
                  VALUES (
                      gen_random_uuid()::text,
                      'LOW_STOCK',
                      NEW.name || ' is running low (' || NEW.quantity || ' remaining)',
                      NEW.id,
                      CASE 
                          WHEN NEW.quantity <= 5 THEN 'HIGH'
                          WHEN NEW.quantity <= threshold_value / 2 THEN 'MEDIUM'
                          ELSE 'LOW'
                      END,
                      false,
                      NOW()
                  );
              END IF;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Drop and create trigger
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS item_low_stock_trigger ON "Item"`);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER item_low_stock_trigger
          AFTER UPDATE OF quantity ON "Item"
          FOR EACH ROW
          WHEN (NEW.quantity IS DISTINCT FROM OLD.quantity)
          EXECUTE FUNCTION check_low_stock();
    `);

    // Create order status function
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION handle_order_status_change()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.status IS DISTINCT FROM OLD.status THEN
              INSERT INTO "Alert" (id, type, message, severity, acknowledged, "createdAt")
              VALUES (
                  gen_random_uuid()::text,
                  'ORDER_STATUS_CHANGED',
                  'Order ' || NEW."orderNumber" || ' status changed to ' || NEW.status,
                  'LOW',
                  false,
                  NOW()
              );
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Drop and create order trigger
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS order_status_change_trigger ON "Order"`);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER order_status_change_trigger
          AFTER UPDATE OF status ON "Order"
          FOR EACH ROW
          WHEN (NEW.status IS DISTINCT FROM OLD.status)
          EXECUTE FUNCTION handle_order_status_change();
    `);
    
    console.log('Database triggers set up successfully!');
    
    // Insert default low stock threshold if it doesn't exist
    await prisma.systemSetting.upsert({
      where: { key: 'lowStockThreshold' },
      create: { key: 'lowStockThreshold', value: '10' },
      update: {}
    });
    
    console.log('Default settings configured!');
  } catch (error) {
    console.error('Error setting up triggers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTriggers();