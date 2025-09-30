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

  // Criar notificação para o usuário convidado (agora inclui o ID do grupo)
  const groupInfo = await prisma.group.findUnique({ where: { id: groupId } });
  await prisma.notification.create({
    data: {
      userId,
      message: `Você foi convidado para o grupo: ${groupInfo?.name}||${groupId}`,
    },
  });

  res.json(group);
});

// Remove member
router.delete("/:groupId/members/:memberId", authMiddleware, async (req: AuthRequest, res) => {
  const { memberId } = req.params;

  await prisma.groupMember.delete({ where: { id: memberId } });
  res.json({ message: "Member removed" });
});

// Aceitar convite para grupo
router.post("/:groupId/accept", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;
  const userId = req.userId!;
  try {
    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId, status: "PENDING" },
    });
    if (!member) return res.status(404).json({ error: "Convite não encontrado ou já aceito." });
    await prisma.groupMember.update({
      where: { id: member.id },
      data: { status: "ACCEPTED" },
    });
    res.json({ message: "Convite aceito!" });
  } catch (e) {
    res.status(500).json({ error: "Erro ao aceitar convite" });
  }
});

export default router;