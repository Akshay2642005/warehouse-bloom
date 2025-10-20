# Database Triggers for Warehouse Bloom

## Overview
These triggers automatically handle inventory management and order/shipment synchronization.

## Triggers Created:

### 1. **Inventory Restock Trigger**
- **Fires on**: Item quantity updates
- **Actions**:
  - Creates restock alerts when quantity increases
  - Creates low stock alerts (≤10 items)
  - Creates out of stock alerts (0 items)

### 2. **Order Status Trigger**
- **Fires on**: Order status changes
- **Actions**:
  - Restores inventory when orders are cancelled
  - Cancels shipments when orders are cancelled
  - Creates status change alerts

### 3. **Order Creation Trigger**
- **Fires on**: New order creation
- **Actions**:
  - Creates new order alerts with total amount

### 4. **Order Item Trigger**
- **Fires on**: OrderItem INSERT/UPDATE/DELETE
- **Actions**:
  - Reduces inventory when items added to orders
  - Restores inventory when items removed from orders
  - Adjusts inventory when quantities change

### 5. **Shipment Status Trigger**
- **Fires on**: Shipment status changes
- **Actions**:
  - Updates order to DELIVERED when shipment delivered
  - Updates order to SHIPPED when shipment in transit
  - Cancels order when shipment cancelled
  - Creates shipment status alerts

### 6. **Shipment Creation Trigger**
- **Fires on**: New shipment creation
- **Actions**:
  - Updates order status from PENDING to PROCESSING

## Installation

```bash
cd server
npm run db:install-triggers
```

## Removal (if needed)

```bash
cd server
npm run db:remove-triggers
```

## How It Works:

1. **Create Order** → Inventory automatically reduced → Alert created
2. **Cancel Order** → Inventory restored → Shipments cancelled → Alert created
3. **Create Shipment** → Order status → PROCESSING
4. **Ship Order** → Order status → SHIPPED → Alert created
5. **Deliver Order** → Order status → DELIVERED → Alert created
6. **Cancel Shipment** → Order cancelled → Inventory restored → Alert created
7. **Restock Items** → Low/out of stock alerts created automatically

## Real-time Updates:
- ✅ Inventory updates immediately when orders change
- ✅ Order status syncs with shipment status
- ✅ Automatic inventory restoration on cancellations
- ✅ Comprehensive alert system for all changes