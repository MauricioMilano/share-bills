"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Create group
router.post("/", authMiddleware_1.authMiddleware, async (req, res) => {
    const { name, description } = req.body;
    if (!name)
        return res.status(400).json({ error: "Group name is required" });
    const group = await prisma.group.create({
        data: {
            name,
            description,
            members: {
                create: [{ userId: req.userId, role: "admin" }],
            },
        },
        include: { members: true },
    });
    res.json(group);
});
// List groups for user
router.get("/", authMiddleware_1.authMiddleware, async (req, res) => {
    const groups = await prisma.group.findMany({
        where: { members: { some: { userId: req.userId } } },
        include: { members: true },
    });
    res.json(groups);
});
// Add member
router.post("/:groupId/members", authMiddleware_1.authMiddleware, async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    if (!userId)
        return res.status(400).json({ error: "Missing userId" });
    const group = await prisma.groupMember.create({
        data: { userId, groupId, role: "member" },
    });
    res.json(group);
});
// Remove member
router.delete("/:groupId/members/:memberId", authMiddleware_1.authMiddleware, async (req, res) => {
    const { memberId } = req.params;
    await prisma.groupMember.delete({ where: { id: memberId } });
    res.json({ message: "Member removed" });
});
exports.default = router;
