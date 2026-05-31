import express from "express";
import cors from "cors";
import "dotenv/config";
import jobRoutes from "./routes/jobRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", jobRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Court Reporting Workflow API is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan mulus di http://localhost:${PORT}`);
});
