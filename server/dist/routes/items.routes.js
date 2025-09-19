"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsRouter = void 0;
const express_1 = require("express");
const items_controller_1 = require("../controllers/items.controller");
const requireAuth_1 = require("../middlewares/requireAuth");
exports.itemsRouter = (0, express_1.Router)();
/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: List items
 *     tags: [Items]
 */
exports.itemsRouter.get('/', requireAuth_1.requireAuth, items_controller_1.getItems);
/**
 * @openapi
 * /api/items:
 *   post:
 *     summary: Create item
 *     tags: [Items]
 */
exports.itemsRouter.post('/', requireAuth_1.requireAuth, items_controller_1.createItem);
/**
 * @openapi
 * /api/items/{id}:
 *   get:
 *     summary: Get item by id
 *     tags: [Items]
 */
exports.itemsRouter.get('/:id', requireAuth_1.requireAuth, items_controller_1.getItemById);
/**
 * @openapi
 * /api/items/{id}:
 *   put:
 *     summary: Update item by id
 *     tags: [Items]
 */
exports.itemsRouter.put('/:id', requireAuth_1.requireAuth, items_controller_1.updateItemById);
/**
 * @openapi
 * /api/items/{id}:
 *   delete:
 *     summary: Delete item by id
 *     tags: [Items]
 */
exports.itemsRouter.delete('/:id', requireAuth_1.requireAuth, items_controller_1.deleteItemById);
