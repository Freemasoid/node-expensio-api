import express, { type Request, type Response } from "express";
import connectDB from "./db/connect";
import { logger } from "./utils/logger";
import { Server } from "http";
import cors from "cors";
import transactionRoutes from "./routes/transactions";
import { config } from "./config";

const app = express();
const PORT = config.port;
let server: Server;

app.use(cors());
app.use(express.json());

app.use("/api/transactions", transactionRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const start = async () => {
  try {
    await connectDB(config.mongoUri as string);
    logger.info("Connected to MongoDB");

    server = app.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}...`);
    });
  } catch (error) {
    logger.error({
      message: "Error starting server",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

start();

process.on("unhandledRejection", (err) => {
  logger.error({
    message: "UNHANDLED REJECTION! 💥 Shutting down...",
    error: err instanceof Error ? err.message : String(err),
  });
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
