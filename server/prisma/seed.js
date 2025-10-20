"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var password_1 = require("../src/utils/password");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, admin, userPassword, user, sampleItems, _i, sampleItems_1, item, items, sampleOrders, orderCount, _a, sampleOrders_1, orderData, orderItems, orderInfo, order, _b, orderItems_1, orderItem;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    console.log('🌱 Starting database seeding...');
                    return [4 /*yield*/, (0, password_1.hashPassword)('admin123')];
                case 1:
                    adminPassword = _m.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@warehouse.com' },
                            update: {},
                            create: {
                                email: 'admin@warehouse.com',
                                password: adminPassword,
                                role: 'admin'
                            }
                        })];
                case 2:
                    admin = _m.sent();
                    return [4 /*yield*/, (0, password_1.hashPassword)('user123')];
                case 3:
                    userPassword = _m.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'user@warehouse.com' },
                            update: {},
                            create: {
                                email: 'user@warehouse.com',
                                password: userPassword,
                                role: 'user'
                            }
                        })];
                case 4:
                    user = _m.sent();
                    sampleItems = [
                        {
                            name: 'Wireless Headphones',
                            sku: 'WH-001',
                            quantity: 45,
                            priceCents: 9999,
                            description: 'High-quality wireless headphones with noise cancellation',
                            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                            ownerId: admin.id
                        },
                        {
                            name: 'Gaming Keyboard',
                            sku: 'GK-002',
                            quantity: 8,
                            priceCents: 12999,
                            description: 'Mechanical gaming keyboard with RGB lighting',
                            imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
                            ownerId: admin.id
                        },
                        {
                            name: 'Office Chair',
                            sku: 'OC-003',
                            quantity: 0,
                            priceCents: 29999,
                            description: 'Ergonomic office chair with lumbar support',
                            imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                            ownerId: user.id
                        },
                        {
                            name: 'Desk Lamp',
                            sku: 'DL-004',
                            quantity: 32,
                            priceCents: 4999,
                            description: 'LED desk lamp with adjustable brightness',
                            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                            ownerId: user.id
                        },
                        {
                            name: 'Water Bottle',
                            sku: 'WB-005',
                            quantity: 12,
                            priceCents: 1999,
                            description: 'Stainless steel water bottle with temperature control',
                            imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
                            ownerId: admin.id
                        },
                        {
                            name: 'Laptop Stand',
                            sku: 'LS-006',
                            quantity: 25,
                            priceCents: 7999,
                            description: 'Adjustable aluminum laptop stand',
                            imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
                            ownerId: user.id
                        },
                        {
                            name: 'Wireless Mouse',
                            sku: 'WM-007',
                            quantity: 3,
                            priceCents: 5999,
                            description: 'Ergonomic wireless mouse with precision tracking',
                            imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
                            ownerId: admin.id
                        },
                        {
                            name: 'Monitor Stand',
                            sku: 'MS-008',
                            quantity: 18,
                            priceCents: 8999,
                            description: 'Dual monitor stand with cable management',
                            imageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400',
                            ownerId: user.id
                        }
                    ];
                    _i = 0, sampleItems_1 = sampleItems;
                    _m.label = 5;
                case 5:
                    if (!(_i < sampleItems_1.length)) return [3 /*break*/, 8];
                    item = sampleItems_1[_i];
                    return [4 /*yield*/, prisma.item.upsert({
                            where: { sku: item.sku },
                            update: {},
                            create: item
                        })];
                case 6:
                    _m.sent();
                    _m.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [4 /*yield*/, prisma.item.findMany()];
                case 9:
                    items = _m.sent();
                    sampleOrders = [
                        {
                            orderNumber: 'ORD-001',
                            status: 'DELIVERED',
                            totalCents: 29997, // 3 headphones
                            userId: admin.id,
                            createdAt: new Date('2024-08-15T10:00:00Z'),
                            orderItems: [
                                { itemId: (_c = items.find(function (i) { return i.sku === 'WH-001'; })) === null || _c === void 0 ? void 0 : _c.id, quantity: 3, priceCents: 9999 }
                            ]
                        },
                        {
                            orderNumber: 'ORD-002',
                            status: 'DELIVERED',
                            totalCents: 18998, // 1 keyboard + 1 mouse
                            userId: user.id,
                            createdAt: new Date('2024-08-20T14:30:00Z'),
                            orderItems: [
                                { itemId: (_d = items.find(function (i) { return i.sku === 'GK-002'; })) === null || _d === void 0 ? void 0 : _d.id, quantity: 1, priceCents: 12999 },
                                { itemId: (_e = items.find(function (i) { return i.sku === 'WM-007'; })) === null || _e === void 0 ? void 0 : _e.id, quantity: 1, priceCents: 5999 }
                            ]
                        },
                        {
                            orderNumber: 'ORD-003',
                            status: 'DELIVERED',
                            totalCents: 9998, // 2 desk lamps
                            userId: admin.id,
                            createdAt: new Date('2024-09-05T09:15:00Z'),
                            orderItems: [
                                { itemId: (_f = items.find(function (i) { return i.sku === 'DL-004'; })) === null || _f === void 0 ? void 0 : _f.id, quantity: 2, priceCents: 4999 }
                            ]
                        },
                        {
                            orderNumber: 'ORD-004',
                            status: 'DELIVERED',
                            totalCents: 41997, // 1 chair + 1 laptop stand + 2 water bottles
                            userId: user.id,
                            createdAt: new Date('2024-09-12T16:45:00Z'),
                            orderItems: [
                                { itemId: (_g = items.find(function (i) { return i.sku === 'OC-003'; })) === null || _g === void 0 ? void 0 : _g.id, quantity: 1, priceCents: 29999 },
                                { itemId: (_h = items.find(function (i) { return i.sku === 'LS-006'; })) === null || _h === void 0 ? void 0 : _h.id, quantity: 1, priceCents: 7999 },
                                { itemId: (_j = items.find(function (i) { return i.sku === 'WB-005'; })) === null || _j === void 0 ? void 0 : _j.id, quantity: 2, priceCents: 1999 }
                            ]
                        },
                        {
                            orderNumber: 'ORD-005',
                            status: 'DELIVERED',
                            totalCents: 17998, // 2 monitor stands
                            userId: admin.id,
                            createdAt: new Date('2024-09-25T11:20:00Z'),
                            orderItems: [
                                { itemId: (_k = items.find(function (i) { return i.sku === 'MS-008'; })) === null || _k === void 0 ? void 0 : _k.id, quantity: 2, priceCents: 8999 }
                            ]
                        },
                        {
                            orderNumber: 'ORD-006',
                            status: 'PENDING',
                            totalCents: 25998, // 2 keyboards
                            userId: user.id,
                            createdAt: new Date('2024-09-28T08:00:00Z'),
                            orderItems: [
                                { itemId: (_l = items.find(function (i) { return i.sku === 'GK-002'; })) === null || _l === void 0 ? void 0 : _l.id, quantity: 2, priceCents: 12999 }
                            ]
                        }
                    ];
                    orderCount = 0;
                    _a = 0, sampleOrders_1 = sampleOrders;
                    _m.label = 10;
                case 10:
                    if (!(_a < sampleOrders_1.length)) return [3 /*break*/, 17];
                    orderData = sampleOrders_1[_a];
                    orderItems = orderData.orderItems, orderInfo = __rest(orderData, ["orderItems"]);
                    return [4 /*yield*/, prisma.order.create({
                            data: orderInfo
                        })];
                case 11:
                    order = _m.sent();
                    _b = 0, orderItems_1 = orderItems;
                    _m.label = 12;
                case 12:
                    if (!(_b < orderItems_1.length)) return [3 /*break*/, 15];
                    orderItem = orderItems_1[_b];
                    return [4 /*yield*/, prisma.orderItem.create({
                            data: __assign(__assign({}, orderItem), { orderId: order.id })
                        })];
                case 13:
                    _m.sent();
                    _m.label = 14;
                case 14:
                    _b++;
                    return [3 /*break*/, 12];
                case 15:
                    orderCount++;
                    _m.label = 16;
                case 16:
                    _a++;
                    return [3 /*break*/, 10];
                case 17:
                    console.log('✅ Database seeding completed!');
                    console.log("\uD83D\uDC64 Admin user: admin@warehouse.com / admin123");
                    console.log("\uD83D\uDC64 Regular user: user@warehouse.com / user123");
                    console.log("\uD83D\uDCE6 Created ".concat(sampleItems.length, " sample items"));
                    console.log("\uD83D\uDED2 Created ".concat(orderCount, " sample orders with order items"));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
