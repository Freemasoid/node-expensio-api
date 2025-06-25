import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getUserTransactions,
} from "../controllers/transactionController";

const router = express.Router();

router.get("/:clerkId", getUserTransactions);

router.post("/:clerkId", createTransaction);

router.delete("/:clerkId", deleteTransaction);

export default router;
