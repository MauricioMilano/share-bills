import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const router = Router();

// Settle all debts in a group (quitar dívidas)
router.post('/:groupId/settle', authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;

  // Get all users in the group
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });
  const userMap = Object.fromEntries(groupMembers.map((m: any) => [m.userId, m.user]));

  // Get balances (excluding already settled payments)
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: true, paidBy: true },
  });
  const payments = await prisma.payment.findMany({ where: { groupId } });

  const balances: Record<string, number> = {};
  for (const exp of expenses) {
    balances[exp.paidById] = (balances[exp.paidById] || 0) + exp.amount;
    for (const s of exp.splits) {
      balances[s.userId] = (balances[s.userId] || 0) - s.amount;
    }
  }
  // Subtract already settled payments
  for (const p of payments) {
    balances[p.fromId] = (balances[p.fromId] || 0) - p.amount;
    balances[p.toId] = (balances[p.toId] || 0) + p.amount;
  }

  // Prepare creditors and debtors
  let creditors = Object.entries(balances).filter(([_, v]) => v > 0).map(([userId, amount]: [string, number]) => ({ userId, amount }));
  let debtors = Object.entries(balances).filter(([_, v]) => v < 0).map(([userId, amount]: [string, number]) => ({ userId, amount: -amount }));

  // Greedy settlement
  const settlements: { from: string, to: string, amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const pay = Math.min(debtor.amount, creditor.amount);
    if (pay > 0.01) {
      settlements.push({ from: debtor.userId, to: creditor.userId, amount: +pay.toFixed(2) });
    }
    debtor.amount -= pay;
    creditor.amount -= pay;
    if (Math.abs(debtor.amount) < 0.01) i++;
    if (Math.abs(creditor.amount) < 0.01) j++;
  }

  // Create Payment records for each settlement
  const createdPayments = [];
  for (const s of settlements) {
  const payment = await prisma.payment.create({
      data: {
        groupId,
        fromId: s.from,
        toId: s.to,
        amount: s.amount,
      },
    });
    createdPayments.push(payment);
  }

  res.json({ message: 'Todas as dívidas foram quitadas!', settlements: createdPayments });
});
// Settle all debts in a group (quitar dívidas)
router.post('/:groupId/settle', authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;

  // Get all users in the group
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });
  const userMap = Object.fromEntries(groupMembers.map((m: any) => [m.userId, m.user]));

  // Get balances (excluding already settled payments)
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: true, paidBy: true },
  });
  const payments = await prisma.payment.findMany({ where: { groupId } });

  const balances: Record<string, number> = {};
  for (const exp of expenses) {
    balances[exp.paidById] = (balances[exp.paidById] || 0) + exp.amount;
    for (const s of exp.splits) {
      balances[s.userId] = (balances[s.userId] || 0) - s.amount;
    }
  }
  // Subtract already settled payments
  for (const p of payments) {
    balances[p.fromId] = (balances[p.fromId] || 0) - p.amount;
    balances[p.toId] = (balances[p.toId] || 0) + p.amount;
  }

  // Prepare creditors and debtors
  let creditors = Object.entries(balances).filter(([_, v]) => v > 0).map(([userId, amount]: [string, number]) => ({ userId, amount }));
  let debtors = Object.entries(balances).filter(([_, v]) => v < 0).map(([userId, amount]: [string, number]) => ({ userId, amount: -amount }));

  // Greedy settlement
  const settlements: { from: string, to: string, amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const pay = Math.min(debtor.amount, creditor.amount);
    if (pay > 0.01) {
      settlements.push({ from: debtor.userId, to: creditor.userId, amount: +pay.toFixed(2) });
    }
    debtor.amount -= pay;
    creditor.amount -= pay;
    if (Math.abs(debtor.amount) < 0.01) i++;
    if (Math.abs(creditor.amount) < 0.01) j++;
  }

  // Create Payment records for each settlement
  const createdPayments = [];
  for (const s of settlements) {
  const payment = await prisma.payment.create({
      data: {
        groupId,
        fromId: s.from,
        toId: s.to,
        amount: s.amount,
      },
    });
    createdPayments.push(payment);
  }

  res.json({ message: 'Todas as dívidas foram quitadas!', settlements: createdPayments });
});

// ...existing code...

// Add expense
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId, description, amount, splits, splitMethod, paidById } = req.body;

  if (!groupId || !description || !amount || !splits || !splitMethod) {
    return res.status(400).json({ error: "Missing fields" });
  }
  // If not provided, fallback to logged-in user
  const payerId = paidById || req.userId;

  // splits: [{ userId, value }] where value is percentage or times or ignored for equal
  let splitAmounts: { userId: string, amount: number }[] = [];
  const total = parseFloat(amount);
  if (splitMethod === "equal") {
    const perUser = +(total / splits.length).toFixed(2);
    splitAmounts = splits.map((s: any) => ({ userId: s.userId, amount: perUser }));
    // Adjust last user for rounding
    const sum = splitAmounts.reduce((acc, s) => acc + s.amount, 0);
    if (sum !== total && splitAmounts.length > 0) {
      splitAmounts[splitAmounts.length - 1].amount += +(total - sum).toFixed(2);
    }
  } else if (splitMethod === "percentage") {
    splitAmounts = splits.map((s: any) => ({ userId: s.userId, amount: +(total * (s.value / 100)).toFixed(2) }));
    // Adjust last user for rounding
    const sum = splitAmounts.reduce((acc, s) => acc + s.amount, 0);
    if (sum !== total && splitAmounts.length > 0) {
      splitAmounts[splitAmounts.length - 1].amount += +(total - sum).toFixed(2);
    }
  } else if (splitMethod === "times") {
    const totalTimes = splits.reduce((acc: number, s: any) => acc + s.value, 0);
    splitAmounts = splits.map((s: any) => ({ userId: s.userId, amount: +(total * (s.value / totalTimes)).toFixed(2) }));
    // Adjust last user for rounding
    const sum = splitAmounts.reduce((acc, s) => acc + s.amount, 0);
    if (sum !== total && splitAmounts.length > 0) {
      splitAmounts[splitAmounts.length - 1].amount += +(total - sum).toFixed(2);
    }
  } else {
    return res.status(400).json({ error: "Invalid split method" });
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: total,
        groupId,
        paidById: payerId,
        splits: {
          create: splitAmounts.map((s) => ({
            userId: s.userId,
            amount: s.amount,
          })),
        },
      },
      include: { splits: true },
    });

    res.json(expense);
  } catch (e) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// List expenses of a group
router.get("/:groupId", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: true, paidBy: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(expenses);
});

// Calculate balances in a group
router.get("/:groupId/balances", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: true, paidBy: true },
  });

  const balances: Record<string, number> = {};

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

// Calculate settlements (who owes whom)
router.get('/:groupId/settlements', authMiddleware, async (req: AuthRequest, res) => {
  const { groupId } = req.params;

  // Get all users in the group
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });
  const userMap = Object.fromEntries(groupMembers.map((m: any) => [m.userId, m.user]));

  // Get balances
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: true, paidBy: true },
  });
  const balances: Record<string, number> = {};
  for (const exp of expenses) {
    balances[exp.paidById] = (balances[exp.paidById] || 0) + exp.amount;
    for (const s of exp.splits) {
      balances[s.userId] = (balances[s.userId] || 0) - s.amount;
    }
  }

  // Prepare creditors and debtors
  let creditors = Object.entries(balances).filter(([_, v]) => v > 0).map(([userId, amount]) => ({ userId, amount }));
  let debtors = Object.entries(balances).filter(([_, v]) => v < 0).map(([userId, amount]) => ({ userId, amount: -amount }));

  // Greedy settlement
  const settlements: { from: string, to: string, amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const pay = Math.min(debtor.amount, creditor.amount);
    settlements.push({ from: debtor.userId, to: creditor.userId, amount: +pay.toFixed(2) });
    debtor.amount -= pay;
    creditor.amount -= pay;
    if (Math.abs(debtor.amount) < 0.01) i++;
    if (Math.abs(creditor.amount) < 0.01) j++;
  }

  // Attach user names
  const result = settlements.map(s => ({
    from: { id: s.from, name: userMap[s.from]?.name || s.from },
    to: { id: s.to, name: userMap[s.to]?.name || s.to },
    amount: s.amount
  }));

  res.json(result);
});

export default router;