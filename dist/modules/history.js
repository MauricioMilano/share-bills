"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Get history of a group (timeline of expenses)
router.get("/:groupId", authMiddleware_1.authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    try {
        const expenses = await prisma.expense.findMany({
            where: { groupId },
            include: { splits: true, paidBy: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(expenses);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});
exports.default = router;
