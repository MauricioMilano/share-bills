import path from "path";
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

// Load env vars
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Splitwise Backend is running 🚀" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/expenses", expenseRoutes);
app.use("/history", historyRoutes);
app.use("/notifications", notificationRoutes);
// Serve frontend build
const __dirnameResolved = path.resolve();
app.use(express.static(path.join(__dirnameResolved, "dist/public")));

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirnameResolved, "dist/public", "index.html"));
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});