"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Get notifications for user
router.get("/", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(notifications);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});
// Mark notification as read
router.post("/:id/read", authMiddleware_1.authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const notif = await prisma.notification.update({
            where: { id },
            data: { read: true },
        });
        res.json(notif);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
});
exports.default = router;
