import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Algoritmo simples para calcular "quem deve para quem"
function calculateSettlements(balances: Record<string, number>) {
  const debtors: { id: string; balance: number }[] = [];
  const creditors: { id: string; balance: number }[] = [];

  for (const [id, balance] of Object.entries(balances)) {
    if (balance < 0) debtors.push({ id, balance });
    else if (balance > 0) creditors.push({ id, balance });
  }

  const settlements: { from: string; to: string; amount: number }[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(-debtor.balance, creditor.balance);
    settlements.push({ from: debtor.id, to: creditor.id, amount });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return settlements;
}

// GET /groups/:id/settlements
router.get("/groups/:id/settlements", authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true },
    });

    if (!expenses || expenses.length === 0) {
      return res.json({ settlements: [] });
    }

    const balances: Record<string, number> = {};

    for (const expense of expenses) {
      balances[expense.paidById] = (balances[expense.paidById] || 0) + expense.amount;
      for (const split of expense.splits) {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      }
    }

    const settlements = calculateSettlements(balances);

    // Mapear com nomes dos usuários
    const users = await prisma.user.findMany({
      where: { id: { in: Object.keys(balances) } },
      select: { id: true, name: true, email: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const result = settlements.map((s) => ({
      from: userMap[s.from]?.name || s.from,
      to: userMap[s.to]?.name || s.to,
      amount: s.amount,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular settlements" });
  }
});

export default router;