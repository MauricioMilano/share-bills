import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// GET /groups/:id/balance
router.get("/groups/:id/balance", authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        splits: true,
        paidBy: true,
      },
    });

    if (!expenses || expenses.length === 0) {
      return res.json({ balances: {} });
    }

    const balances: Record<string, number> = {};

    for (const expense of expenses) {
      // Quem pagou
      const payerId = expense.paidById;
      balances[payerId] = (balances[payerId] || 0) + expense.amount;

      // Divisão da despesa
      for (const split of expense.splits) {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      }
    }

    // Buscar dados dos usuários para retornar nome/email junto
    const users = await prisma.user.findMany({
      where: { id: { in: Object.keys(balances) } },
      select: { id: true, name: true, email: true },
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      balance: balances[u.id] || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular balanço do grupo" });
  }
});

export default router;