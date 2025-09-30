-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to emit NOTIFY on alert insert
CREATE OR REPLACE FUNCTION notify_alert() RETURNS trigger AS $$
DECLARE
  payload JSON;
BEGIN
  payload = json_build_object(
    'id', NEW.id,
    'type', NEW.type,
    'message', NEW.message,
    'itemId', NEW.itemId,
    'severity', NEW.severity,
    'createdAt', NEW.createdAt
  );
  PERFORM pg_notify('alert_channel', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-insert alerts when item quantity changes
CREATE OR REPLACE FUNCTION item_alerts_on_quantity_change() RETURNS trigger AS $$
DECLARE
  alert_type TEXT;
  severity TEXT;
  msg TEXT;
BEGIN
  IF NEW.quantity = 0 AND (OLD.quantity IS DISTINCT FROM NEW.quantity) THEN
    alert_type := 'OUT_OF_STOCK';
    severity := 'CRITICAL';
    msg := 'Item is out of stock';
  ELSIF NEW.quantity < 10 AND (OLD.quantity IS DISTINCT FROM NEW.quantity) THEN
    alert_type := 'LOW_STOCK';
    severity := CASE WHEN NEW.quantity < 5 THEN 'HIGH' ELSE 'MEDIUM' END;
    msg := 'Item stock is low';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO "Alert" (id, type, message, "itemId", severity, "acknowledged", "createdAt")
  VALUES (gen_random_uuid(), alert_type::"AlertType", msg, NEW.id, severity::"Severity", false, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to Item updates
DROP TRIGGER IF EXISTS trg_item_alerts_on_quantity_change ON "Item";
CREATE TRIGGER trg_item_alerts_on_quantity_change
AFTER UPDATE OF quantity ON "Item"
FOR EACH ROW
EXECUTE FUNCTION item_alerts_on_quantity_change();

-- Attach trigger to Alert inserts for NOTIFY
DROP TRIGGER IF EXISTS trg_notify_alert ON "Alert";
CREATE TRIGGER trg_notify_alert
AFTER INSERT ON "Alert"
FOR EACH ROW
EXECUTE FUNCTION notify_alert(); 