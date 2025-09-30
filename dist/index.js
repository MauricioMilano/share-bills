"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./modules/auth"));
const groups_1 = __importDefault(require("./modules/groups"));
const expenses_1 = __importDefault(require("./modules/expenses"));
const history_1 = __importDefault(require("./modules/history"));
const notifications_1 = __importDefault(require("./modules/notifications"));
const balance_1 = __importDefault(require("./modules/balance"));
const settlements_1 = __importDefault(require("./modules/settlements"));
const payments_1 = __importDefault(require("./modules/payments"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Healthcheck
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Splitwise Backend is running 🚀" });
});
// Rotas API
app.use("/api/auth", auth_1.default);
app.use("/api/groups", groups_1.default);
app.use("/api/expenses", expenses_1.default);
app.use("/api/history", history_1.default);
app.use("/api/notifications", notifications_1.default);
app.use("/api", balance_1.default);
app.use("/api", settlements_1.default);
app.use("/api", payments_1.default);
// Servir frontend
const __dirnameResolved = path_1.default.resolve();
app.use(express_1.default.static(path_1.default.join(__dirnameResolved, "dist/public")));
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirnameResolved, "dist/public", "index.html"));
});
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
