import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const router = Router();

// Get notifications for user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.post("/:id/read", authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const notif = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.json(notif);
  } catch (e) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

export default router;