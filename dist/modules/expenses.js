"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Add expense
router.post("/", authMiddleware_1.authMiddleware, async (req, res) => {
    const { groupId, description, amount, splits } = req.body;
    if (!groupId || !description || !amount || !splits) {
        return res.status(400).json({ error: "Missing fields" });
    }
    try {
        const expense = await prisma.expense.create({
            data: {
                description,
                amount,
                groupId,
                paidById: req.userId,
                splits: {
                    create: splits.map((s) => ({
                        userId: s.userId,
                        amount: s.amount,
                    })),
                },
            },
            include: { splits: true },
        });
        res.json(expense);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to create expense" });
    }
});
// List expenses of a group
router.get("/:groupId", authMiddleware_1.authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: { splits: true, paidBy: true },
        orderBy: { createdAt: "desc" },
    });
    res.json(expenses);
});
// Calculate balances in a group
router.get("/:groupId/balances", authMiddleware_1.authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: { splits: true, paidBy: true },
    });
    const balances = {};
    for (const exp of expenses) {
        // paidBy user gets credited
        balances[exp.paidById] = (balances[exp.paidById] || 0) + exp.amount;
        // splits subtract
        for (const s of exp.splits) {
            balances[s.userId] = (balances[s.userId] || 0) - s.amount;
        }
    }
    res.json(balances);
});
exports.default = router;
