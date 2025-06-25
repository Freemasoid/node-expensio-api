import type { Request, Response } from "express";
import { TransactionModel } from "../models/Transaction";
import { NotFoundError } from "../errors/custom-errors";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Transaction } from "../types/types";

export const getUserTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;

  const userTransactions = await TransactionModel.findOne({ clerkId });

  if (!userTransactions) {
    throw NotFoundError(
      `There are no transactions for user with id: ${clerkId}`
    );
  }

  res.status(StatusCodes.OK).json(userTransactions);
};

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const data = req.body;

    let transactionDate: Date;
    try {
      transactionDate = new Date(data.date);
      if (isNaN(transactionDate.getTime())) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: "Invalid date format. Expected ISO string format.",
        });
        return;
      }
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid date format. Expected ISO string format.",
      });
      return;
    }

    const now = new Date();
    const year = transactionDate.getFullYear().toString();
    const month = (transactionDate.getMonth() + 1).toString().padStart(2, "0");

    const userTransactions = await TransactionModel.findOne({ clerkId });

    if (!userTransactions) {
      throw NotFoundError(
        `There are no transactions for user with id: ${clerkId}`
      );
    }

    if (!userTransactions.transactions[year]) {
      userTransactions.transactions[year] = {};
    }

    if (!userTransactions.transactions[year][month]) {
      userTransactions.transactions[year][month] = [];
    }

    data.type === "expense"
      ? (userTransactions.totalSpend += data.amount)
      : (userTransactions.totalIncome += data.amount);

    const newTransaction: Transaction = {
      _id: { $oid: new mongoose.Types.ObjectId().toString() },
      title: data.title,
      category: data.category,
      amount: data.amount,
      type: data.type,
      date: data.date,
      description: data.description || "",
      createdAt: now,
      updatedAt: now,
      _v: 0,
    };

    userTransactions.transactions[year][month].push(newTransaction);

    if (!userTransactions.categorySummaries[year]) {
      userTransactions.categorySummaries[year] = {};
    }

    if (!userTransactions.categorySummaries[year][data.category]) {
      userTransactions.categorySummaries[year][data.category] = {
        yearlySpend: 0,
        monthlyBreakdown: {},
      };
    }

    userTransactions.categorySummaries[year][data.category].yearlySpend +=
      data.amount;

    const monthlyBreakdown =
      userTransactions.categorySummaries[year][data.category].monthlyBreakdown;

    if (!monthlyBreakdown[month]) {
      monthlyBreakdown[month] = {
        monthlySpend: data.amount,
        transactionCount: 1,
        lastUpdated: now.toISOString(),
      };
    } else {
      monthlyBreakdown[month].monthlySpend += data.amount;
      monthlyBreakdown[month].transactionCount += 1;
      monthlyBreakdown[month].lastUpdated = now.toISOString();
    }

    // Explicitly mark Mixed fields as modified for MongoDB
    userTransactions.markModified("transactions");
    userTransactions.markModified("categorySummaries");

    await userTransactions.save();

    res.status(StatusCodes.CREATED).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const data: Transaction = req.body;

    const now = new Date();
    const transactionDate = new Date(data.date);
    const year = transactionDate.getFullYear().toString();
    const month = (transactionDate.getMonth() + 1).toString().padStart(2, "0");

    const userTransactions = await TransactionModel.findOne({ clerkId });

    if (!userTransactions) {
      throw NotFoundError(
        `There are no transactions for user with id: ${clerkId}`
      );
    }

    await TransactionModel.updateOne(
      { clerkId },
      {
        $pull: {
          [`transactions.${year}.${month}`]: {
            _id: data._id.$oid,
          },
        },
      }
    );

    data.type === "expense"
      ? (userTransactions.totalSpend -= data.amount)
      : (userTransactions.totalIncome -= data.amount);

    const monthlyBreakdown =
      userTransactions.categorySummaries[year][data.category].monthlyBreakdown[
        month
      ];

    monthlyBreakdown.monthlySpend -= data.amount;
    monthlyBreakdown.transactionCount -= 1;
    monthlyBreakdown.lastUpdated = now.toISOString();

    userTransactions.categorySummaries[year][data.category].yearlySpend -=
      data.amount;

    // Explicitly mark Mixed fields as modified for MongoDB
    userTransactions.markModified("transactions");
    userTransactions.markModified("categorySummaries");

    await userTransactions.save();

    res.status(StatusCodes.OK).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    throw error;
  }
};
