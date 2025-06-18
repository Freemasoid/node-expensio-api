import express from "express";
import type { Request, Response } from "express";
import { TransactionModel } from "../models/Transaction";

const router = express.Router();

router.get("/:clerkId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const userTransactions = await TransactionModel.findOne({ clerkId });

    if (!userTransactions) {
      res.json({
        success: true,
        data: {
          totalSpend: 0,
          totalIncome: 0,
          transactions: {},
          categorySummaries: {},
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        totalSpend: userTransactions.totalSpend,
        totalIncome: userTransactions.totalIncome,
        transactions: userTransactions.transactions,
        categorySummaries: userTransactions.categorySummaries,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred during getUserTransactions call";
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
