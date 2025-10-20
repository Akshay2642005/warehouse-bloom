-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Item_sku_idx" ON "Item"("sku");

-- CreateIndex
CREATE INDEX "Item_quantity_idx" ON "Item"("quantity");

-- CreateIndex
CREATE INDEX "Item_ownerId_idx" ON "Item"("ownerId");

-- CreateIndex
CREATE INDEX "Item_updatedAt_idx" ON "Item"("updatedAt");

-- CreateIndex
CREATE INDEX "Item_name_sku_description_idx" ON "Item"("name", "sku", "description");
