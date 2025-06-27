import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getUserTransactions,
  updateTransaction,
} from "../controllers/transactionController";

const router = express.Router();

router.get("/:clerkId", getUserTransactions);

router.post("/:clerkId", createTransaction);

router.delete("/:clerkId", deleteTransaction);

router.post("/update/:clerkId", updateTransaction);

export default router;
