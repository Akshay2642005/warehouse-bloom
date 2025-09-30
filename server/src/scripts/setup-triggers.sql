-- Create function to check low stock and create alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
    threshold_value INTEGER;
    existing_alert_count INTEGER;
BEGIN
    -- Get the low stock threshold from system settings
    SELECT COALESCE(value::INTEGER, 10) INTO threshold_value
    FROM "SystemSetting" 
    WHERE key = 'lowStockThreshold';
    
    -- Check if quantity is at or below threshold
    IF NEW.quantity <= threshold_value THEN
        -- Check if there's already an unacknowledged alert for this item
        SELECT COUNT(*) INTO existing_alert_count
        FROM "Alert"
        WHERE "itemId" = NEW.id 
        AND type = 'LOW_STOCK' 
        AND acknowledged = false;
        
        -- Only create alert if none exists
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

-- Create trigger for item updates
DROP TRIGGER IF EXISTS item_low_stock_trigger ON "Item";
CREATE TRIGGER item_low_stock_trigger
    AFTER UPDATE OF quantity ON "Item"
    FOR EACH ROW
    WHEN (NEW.quantity IS DISTINCT FROM OLD.quantity)
    EXECUTE FUNCTION check_low_stock();

-- Create function to handle order status changes
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Create alert for order status change
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

-- Create trigger for order status updates
DROP TRIGGER IF EXISTS order_status_change_trigger ON "Order";
CREATE TRIGGER order_status_change_trigger
    AFTER UPDATE OF status ON "Order"
    FOR EACH ROW
    WHEN (NEW.status IS DISTINCT FROM OLD.status)
    EXECUTE FUNCTION handle_order_status_change();