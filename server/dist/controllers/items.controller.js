"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItems = getItems;
exports.createItem = createItem;
exports.getItemById = getItemById;
exports.updateItemById = updateItemById;
exports.deleteItemById = deleteItemById;
const item_service_1 = require("../services/item.service");
const item_schema_1 = require("../validation/item.schema");
const apiResponse_1 = require("../utils/apiResponse");
const zod_1 = require("zod");
/**
 * Lists items with pagination and filters.
 */
async function getItems(req, res) {
    const { page = 1, pageSize = 10, q } = item_schema_1.queryItemsSchema.parse(req.query);
    const result = await item_service_1.ItemService.getItems({ page, pageSize, search: q });
    res.status(200).json((0, apiResponse_1.createResponse)({
        data: result,
        message: 'Items retrieved successfully'
    }));
}
/**
 * Creates a new item.
 */
async function createItem(req, res) {
    const itemData = item_schema_1.createItemSchema.parse(req.body);
    const userId = req.user.id;
    const item = await item_service_1.ItemService.createItem({ ...itemData, ownerId: userId });
    res.status(201).json((0, apiResponse_1.createResponse)({
        data: { item },
        message: 'Item created successfully'
    }));
}
/**
 * Retrieves a single item by id.
 */
async function getItemById(req, res) {
    const { id } = zod_1.z.object({ id: zod_1.z.string() }).parse(req.params);
    const item = await item_service_1.ItemService.getItemById(id);
    if (!item) {
        res.status(404).json((0, apiResponse_1.createResponse)({ success: false, message: 'Item not found' }));
        return;
    }
    res.status(200).json((0, apiResponse_1.createResponse)({
        data: { item },
        message: 'Item retrieved successfully'
    }));
}
/**
 * Updates an item by id.
 */
async function updateItemById(req, res) {
    const { id } = zod_1.z.object({ id: zod_1.z.string() }).parse(req.params);
    const updateData = item_schema_1.updateItemSchema.parse(req.body);
    const item = await item_service_1.ItemService.updateItem(id, updateData);
    if (!item) {
        res.status(404).json((0, apiResponse_1.createResponse)({ success: false, message: 'Item not found' }));
        return;
    }
    res.status(200).json((0, apiResponse_1.createResponse)({
        data: { item },
        message: 'Item updated successfully'
    }));
}
/**
 * Deletes an item by id.
 */
async function deleteItemById(req, res) {
    const { id } = zod_1.z.object({ id: zod_1.z.string() }).parse(req.params);
    const deleted = await item_service_1.ItemService.deleteItem(id);
    if (!deleted) {
        res.status(404).json((0, apiResponse_1.createResponse)({ success: false, message: 'Item not found' }));
        return;
    }
    res.status(204).send();
}
