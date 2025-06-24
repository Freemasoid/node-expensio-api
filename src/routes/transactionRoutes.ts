import express from "express";
import {
  createTransaction,
  getUserTransactions,
} from "../controllers/transactionController";

const router = express.Router();

router.get("/:clerkId", getUserTransactions);

router.post("/:clerkId", createTransaction);

export default router;
