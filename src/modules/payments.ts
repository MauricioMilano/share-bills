import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// POST /groups/:id/payments
router.post("/groups/:id/payments", authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    const { fromUserId, toUserId, amount } = req.body;

    if (!fromUserId || !toUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const payment = await prisma.expense.create({
      data: {
        description: `Pagamento de ${fromUserId} para ${toUserId}`,
        amount,
        paidById: fromUserId,
        groupId,
        splits: {
          create: [
            {
              userId: toUserId,
              amount,
            },
          ],
        },
      },
      include: { splits: true },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar pagamento" });
  }
});

export default router;