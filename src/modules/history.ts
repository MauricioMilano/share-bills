import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const router = Router();

// Get history of a group (timeline of expenses)
router.get("/:groupId", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true, paidBy: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(expenses);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;