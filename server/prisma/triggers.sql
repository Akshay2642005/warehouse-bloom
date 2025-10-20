-- =====================================================
-- WAREHOUSE BLOOM DATABASE TRIGGERS
-- =====================================================

-- 1. INVENTORY RESTOCK TRIGGER
-- Automatically creates alerts when items are restocked
CREATE OR REPLACE FUNCTION handle_inventory_restock()
RETURNS TRIGGER AS $$
BEGIN
    -- If quantity increased (restock)
    IF NEW.quantity > OLD.quantity THEN
        INSERT INTO "Alert" (id, type, message, "itemId", severity, acknowledged, new, "createdAt")
        VALUES (
            'alert_' || generate_random_uuid(),
            'ORDER_CREATED'::"AlertType",
            'Item ' || NEW.name || ' restocked. New quantity: ' || NEW.quantity,
            NEW.id,
            'LOW'::"Severity",
            false,
            true,
            NOW()
        );
    END IF;
    
    -- Check for low stock alert
    IF NEW.quantity <= 10 AND NEW.quantity > 0 THEN
        INSERT INTO "Alert" (id, type, message, "itemId", severity, acknowledged, new, "createdAt")
        VALUES (
            'alert_' || generate_random_uuid(),
            'LOW_STOCK'::"AlertType",
            'Low stock alert for ' || NEW.name || '. Quantity: ' || NEW.quantity,
            NEW.id,
            'MEDIUM'::"Severity",
            false,
            true,
            NOW()
        );
    END IF;
    
    -- Check for out of stock alert
    IF NEW.quantity = 0 AND OLD.quantity > 0 THEN
        INSERT INTO "Alert" (id, type, message, "itemId", severity, acknowledged, new, "createdAt")
        VALUES (
            'alert_' || generate_random_uuid(),
            'OUT_OF_STOCK'::"AlertType",
            'Item ' || NEW.name || ' is out of stock!',
            NEW.id,
            'HIGH'::"Severity",
            false,
            true,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ORDER STATUS TRIGGER
-- Updates inventory when orders are created, cancelled, or status changes
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    order_item RECORD;
BEGIN
    -- Handle order cancellation - restore inventory
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        -- Restore inventory for all items in the order
        FOR order_item IN 
            SELECT oi."itemId", oi.quantity 
            FROM "OrderItem" oi 
            WHERE oi."orderId" = NEW.id
        LOOP
            UPDATE "Item" 
            SET quantity = quantity + order_item.quantity
            WHERE id = order_item."itemId";
        END LOOP;
        
        -- Cancel all shipments for this order
        UPDATE "Shipment" 
        SET status = 'Cancelled'
        WHERE "orderId" = NEW.id AND status != 'Delivered';
        
        -- Create alert for order cancellation
        INSERT INTO "Alert" (id, type, message, severity, acknowledged, new, "createdAt")
        VALUES (
            'alert_' || generate_random_uuid(),
            'ORDER_STATUS_CHANGED'::"AlertType",
            'Order ' || NEW."orderNumber" || ' has been cancelled. Inventory restored.',
            'MEDIUM'::"Severity",
            false,
            true,
            NOW()
        );
    END IF;
    
    -- Handle order completion - create alert
    IF NEW.status = 'DELIVERED' AND OLD.status != 'DELIVERED' THEN
        INSERT INTO "Alert" (id, type, message, severity, acknowledged, new, "createdAt")
        VALUES (
            'alert_' || generate_random_uuid(),
            'ORDER_STATUS_CHANGED'::"AlertType",
            'Order ' || NEW."orderNumber" || ' has been delivered successfully.',
            'LOW'::"Severity",
            false,
            true,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ORDER CREATION TRIGGER
-- Reduces inventory when new orders are created
CREATE OR REPLACE FUNCTION handle_order_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Create alert for new order
    INSERT INTO "Alert" (id, type, message, severity, acknowledged, new, "createdAt")
    VALUES (
        'alert_' || generate_random_uuid(),
        'ORDER_CREATED'::"AlertType",
        'New order ' || NEW."orderNumber" || ' created for $' || (NEW."totalCents"::DECIMAL / 100),
        'LOW'::"Severity",
        false,
        true,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. ORDER ITEM TRIGGER
-- Updates inventory when order items are added/removed
CREATE OR REPLACE FUNCTION handle_order_item_change()
RETURNS TRIGGER AS $$
DECLARE
    order_status TEXT;
BEGIN
    -- Get order status
    SELECT status INTO order_status FROM "Order" WHERE id = COALESCE(NEW."orderId", OLD."orderId");
    
    -- Only affect inventory for non-cancelled orders
    IF order_status != 'CANCELLED' THEN
        -- Handle INSERT (new order item)
        IF TG_OP = 'INSERT' THEN
            UPDATE "Item" 
            SET quantity = quantity - NEW.quantity
            WHERE id = NEW."itemId";
            
        -- Handle DELETE (order item removed)
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE "Item" 
            SET quantity = quantity + OLD.quantity
            WHERE id = OLD."itemId";
            
        -- Handle UPDATE (quantity changed)
        ELSIF TG_OP = 'UPDATE' THEN
            UPDATE "Item" 
            SET quantity = quantity - (NEW.quantity - OLD.quantity)
            WHERE id = NEW."itemId";
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. SHIPMENT STATUS TRIGGER
-- Updates order status based on shipment status
CREATE OR REPLACE FUNCTION handle_shipment_status_change()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
BEGIN
    -- Get order details
    SELECT * INTO order_record FROM "Order" WHERE id = NEW."orderId";
    
    -- Update order status based on shipment status
    IF NEW.status = 'Delivered' AND OLD.status != 'Delivered' THEN
        UPDATE "Order" 
        SET status = 'DELIVERED'
        WHERE id = NEW."orderId";
        
    ELSIF NEW.status = 'In Transit' AND order_record.status = 'PROCESSING' THEN
        UPDATE "Order" 
        SET status = 'SHIPPED'
        WHERE id = NEW."orderId";
        
    ELSIF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
        -- If shipment is cancelled, restore inventory and cancel order
        UPDATE "Order" 
        SET status = 'CANCELLED'
        WHERE id = NEW."orderId" AND status != 'DELIVERED';
    END IF;
    
    -- Create alert for shipment status change
    INSERT INTO "Alert" (id, type, message, severity, acknowledged, new, "createdAt")
    VALUES (
        'alert_' || generate_random_uuid(),
        'ORDER_STATUS_CHANGED'::"AlertType",
        'Shipment ' || NEW."trackingNumber" || ' status changed to: ' || NEW.status,
        CASE 
            WHEN NEW.status = 'Delivered' THEN 'LOW'::"Severity"
            WHEN NEW.status = 'Cancelled' THEN 'HIGH'::"Severity"
            ELSE 'MEDIUM'::"Severity"
        END,
        false,
        true,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. SHIPMENT CREATION TRIGGER
-- Updates order status when shipment is created
CREATE OR REPLACE FUNCTION handle_shipment_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order status to PROCESSING when first shipment is created
    UPDATE "Order" 
    SET status = 'PROCESSING'
    WHERE id = NEW."orderId" AND status = 'PENDING';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS inventory_restock_trigger ON "Item";
DROP TRIGGER IF EXISTS order_status_change_trigger ON "Order";
DROP TRIGGER IF EXISTS order_creation_trigger ON "Order";
DROP TRIGGER IF EXISTS order_item_change_trigger ON "OrderItem";
DROP TRIGGER IF EXISTS shipment_status_change_trigger ON "Shipment";
DROP TRIGGER IF EXISTS shipment_creation_trigger ON "Shipment";

-- Create triggers
CREATE TRIGGER inventory_restock_trigger
    AFTER UPDATE ON "Item"
    FOR EACH ROW
    WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
    EXECUTE FUNCTION handle_inventory_restock();

CREATE TRIGGER order_status_change_trigger
    AFTER UPDATE ON "Order"
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION handle_order_status_change();

CREATE TRIGGER order_creation_trigger
    AFTER INSERT ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_creation();

CREATE TRIGGER order_item_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "OrderItem"
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_item_change();

CREATE TRIGGER shipment_status_change_trigger
    AFTER UPDATE ON "Shipment"
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION handle_shipment_status_change();

CREATE TRIGGER shipment_creation_trigger
    AFTER INSERT ON "Shipment"
    FOR EACH ROW
    EXECUTE FUNCTION handle_shipment_creation();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to generate random UUID (if not available)
CREATE OR REPLACE FUNCTION generate_random_uuid()
RETURNS TEXT AS $$
BEGIN
    RETURN 'alert_' || substr(md5(random()::text), 1, 25);
END;
$$ LANGUAGE plpgsql;