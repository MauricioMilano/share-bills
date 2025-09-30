"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./modules/auth"));
const groups_1 = __importDefault(require("./modules/groups"));
const expenses_1 = __importDefault(require("./modules/expenses"));
const history_1 = __importDefault(require("./modules/history"));
const notifications_1 = __importDefault(require("./modules/notifications"));
// Load env vars
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get("/", (req, res) => {
    res.json({ message: "Splitwise Backend is running 🚀" });
});
// Routes
app.use("/auth", auth_1.default);
app.use("/groups", groups_1.default);
app.use("/expenses", expenses_1.default);
app.use("/history", history_1.default);
app.use("/notifications", notifications_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
