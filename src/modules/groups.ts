import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const router = Router();

// Create group
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Group name is required" });

  const group = await prisma.group.create({
    data: {
      name,
      description,
      members: {
        create: [{ userId: req.userId!, role: "admin" }],
      },
    },
    include: { members: true },
  });

  res.json(group);
});

// List groups for user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: req.userId! } } },
    include: { members: true },
  });
  res.json(groups);
});

// Add member
router.post("/:groupId/members", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const group = await prisma.groupMember.create({
    data: { userId, groupId, role: "member" },
  });

  res.json(group);
});

// Remove member
router.delete("/:groupId/members/:memberId", authMiddleware, async (req: AuthRequest, res) => {
  const { memberId } = req.params;

  await prisma.groupMember.delete({ where: { id: memberId } });
  res.json({ message: "Member removed" });
});

export default router;