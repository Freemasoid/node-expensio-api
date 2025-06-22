import type { Request, Response } from "express";
import { TransactionModel } from "../models/Transaction";

export const getUserTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkId } = req.params;

    if (!clerkId) {
      res.status(400).json({
        success: false,
        error: "ClerkId parameter is required",
      });
      return;
    }

    const userTransactions = await TransactionModel.findOne({ clerkId });

    if (!userTransactions) {
      res.json({
        success: false,
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
    console.error("Error in getUserTransactions:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred during getUserTransactions call";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
