-- Trigger to sync order status when shipment status changes
CREATE OR REPLACE FUNCTION sync_order_status_on_shipment_update()
RETURNS TRIGGER AS $$
BEGIN
    -- When shipment is created, set order to SHIPPED
    IF TG_OP = 'INSERT' THEN
        UPDATE "Order" 
        SET status = 'SHIPPED'
        WHERE id = NEW."orderId";
        RETURN NEW;
    END IF;

    -- When shipment status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- Delivered shipment -> Delivered order
        IF NEW.status = 'Delivered' THEN
            UPDATE "Order" 
            SET status = 'DELIVERED'
            WHERE id = NEW."orderId";
        
        -- Cancelled shipment -> Cancelled order + restore inventory
        ELSIF NEW.status = 'Cancelled' THEN
            UPDATE "Order" 
            SET status = 'CANCELLED'
            WHERE id = NEW."orderId";
            
            -- Restore inventory
            UPDATE "Item" 
            SET quantity = quantity + oi.quantity
            FROM "OrderItem" oi
            WHERE "Item".id = oi."itemId" 
            AND oi."orderId" = NEW."orderId";
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS shipment_status_sync ON "Shipment";
CREATE TRIGGER shipment_status_sync
    AFTER INSERT OR UPDATE ON "Shipment"
    FOR EACH ROW
    EXECUTE FUNCTION sync_order_status_on_shipment_update();