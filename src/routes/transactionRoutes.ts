import express from "express";
import { getUserTransactions } from "../controllers/transactionController";

const router = express.Router();

router.get("/:clerkId", getUserTransactions);

export default router;
