import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./modules/auth";
import groupRoutes from "./modules/groups";
import expenseRoutes from "./modules/expenses";
import historyRoutes from "./modules/history";
import notificationRoutes from "./modules/notifications";
import balanceRoutes from "./modules/balance";
import settlementsRoutes from "./modules/settlements";
import paymentsRoutes from "./modules/payments";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Splitwise Backend is running 🚀" });
});

// Rotas API
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", balanceRoutes);
app.use("/api", settlementsRoutes);
app.use("/api", paymentsRoutes);

// Listar todos os usuários (apenas para admin ou debug)
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Servir frontend
const __dirnameResolved = path.resolve();
app.use(express.static(path.join(__dirnameResolved, "dist/public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirnameResolved, "dist/public", "index.html"));
});

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});