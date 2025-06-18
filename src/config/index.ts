import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5174,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  environment: process.env.NODE_ENV || "development",
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production",
  },
};
