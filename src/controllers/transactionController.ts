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
  const { month, year } = req.query;

  let userTransactions;

  switch (year) {
    case year && month: {
      const projection = {
        _id: 1,
        totalSpend: 1,
        totalIncome: 1,
        [`transactions.${year}.${month}`]: 1,
        [`categorySummaries.${year}`]: 1,
      } as any;

      userTransactions = await TransactionModel.findOne(
        { clerkId },
        projection
      );
    }
    case year && !month: {
      const projection = {
        _id: 1,
        totalSpend: 1,
        totalIncome: 1,
        [`transactions.${year}`]: 1,
        [`categorySummaries.${year}`]: 1,
      } as any;

      userTransactions = await TransactionModel.findOne(
        { clerkId },
        projection
      );
    }
    default:
      userTransactions = await TransactionModel.findOne({ clerkId });
  }

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
  const { clerkId } = req.params;
  const data = req.body;

  const now = new Date();
  const transactionDate = new Date(data.date);
  const year = transactionDate.getFullYear().toString();
  const month = (transactionDate.getMonth() + 1).toString().padStart(2, "0");

  // Use projection to fetch only necessary data
  const projection = {
    _id: 1,
    totalSpend: 1,
    totalIncome: 1,
    [`transactions.${year}.${month}`]: 1,
    [`categorySummaries.${year}.${data.category}`]: 1,
  } as any;

  const userTransactions = await TransactionModel.findOne(
    { clerkId },
    projection
  );

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
    _id: new mongoose.Types.ObjectId().toString(),
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
};

export const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;
  const data: Transaction = req.body;

  const now = new Date();
  const transactionDate = new Date(data.date);
  const year = transactionDate.getFullYear().toString();
  const month = (transactionDate.getMonth() + 1).toString().padStart(2, "0");

  const projection = {
    _id: 1,
    totalSpend: 1,
    totalIncome: 1,
    [`transactions.${year}.${month}`]: 1,
    [`categorySummaries.${year}.${data.category}`]: 1,
  } as any;

  const userTransactions = await TransactionModel.findOne(
    { clerkId },
    projection
  );

  if (!userTransactions) {
    throw NotFoundError(
      `There are no transactions for user with id: ${clerkId}`
    );
  }

  const transactionId =
    typeof data._id === "string" ? data._id : (data._id as any).$oid;

  const monthTransactions = userTransactions.transactions?.[year]?.[month];
  const transactionIndex = monthTransactions?.findIndex(
    (t) => t._id.toString() === transactionId
  );

  if (transactionIndex === undefined || transactionIndex === -1) {
    throw NotFoundError(
      `Transaction with id ${transactionId} not found for the specified date`
    );
  }

  monthTransactions.splice(transactionIndex, 1);

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
};

export const updateTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;
  const data = req.body;

  const now = new Date();

  const transactionId =
    typeof data._id === "string" ? data._id : (data._id as any).$oid;

  const oldTransactionDate = new Date(data.date);
  const oldYear = oldTransactionDate.getFullYear().toString();
  const oldMonth = (oldTransactionDate.getMonth() + 1)
    .toString()
    .padStart(2, "0");

  const newDate = data.newDate || data.date;
  const newTransactionDate = new Date(newDate);
  const newYear = newTransactionDate.getFullYear().toString();
  const newMonth = (newTransactionDate.getMonth() + 1)
    .toString()
    .padStart(2, "0");

  const projection = {
    _id: 1,
    totalSpend: 1,
    totalIncome: 1,
    [`transactions.${oldYear}.${oldMonth}`]: 1,
    [`categorySummaries.${oldYear}.${data.category}`]: 1,
  } as any;

  const dateChanged = oldYear !== newYear || oldMonth !== newMonth;
  if (dateChanged) {
    projection[`transactions.${newYear}.${newMonth}`] = 1;
    if (data.category) {
      projection[`categorySummaries.${newYear}.${data.category}`] = 1;
    }
  }

  const userTransactions = await TransactionModel.findOne(
    { clerkId },
    projection
  );

  if (!userTransactions) {
    throw NotFoundError(
      `There are no transactions for user with id: ${clerkId}`
    );
  }

  const oldMonthTransactions =
    userTransactions.transactions?.[oldYear]?.[oldMonth];
  const transactionIndex = oldMonthTransactions?.findIndex(
    (t) => t._id.toString() === transactionId
  );

  if (transactionIndex === undefined || transactionIndex === -1) {
    throw NotFoundError(
      `Transaction with id ${transactionId} not found in the specified date location`
    );
  }

  const existingTransaction = oldMonthTransactions[transactionIndex];
  const oldAmount = existingTransaction.amount;
  const oldType = existingTransaction.type;
  const oldCategory = existingTransaction.category;

  if (oldType === "expense") {
    userTransactions.totalSpend -= oldAmount;
  } else {
    userTransactions.totalIncome -= oldAmount;
  }

  if (data.type === "expense") {
    userTransactions.totalSpend += data.amount;
  } else {
    userTransactions.totalIncome += data.amount;
  }

  const updatedTransaction: Transaction = {
    _id: transactionId,
    title: data.title,
    category: data.category,
    amount: data.amount,
    type: data.type,
    date: newDate,
    description: data.description || "",
    createdAt: (existingTransaction as any).createdAt || now,
    updatedAt: now,
    _v: (existingTransaction as any)._v || 0,
  };

  if (dateChanged) {
    oldMonthTransactions.splice(transactionIndex, 1);

    if (!userTransactions.transactions[newYear]) {
      userTransactions.transactions[newYear] = {};
    }
    if (!userTransactions.transactions[newYear][newMonth]) {
      userTransactions.transactions[newYear][newMonth] = [];
    }

    userTransactions.transactions[newYear][newMonth].push(updatedTransaction);
  } else {
    oldMonthTransactions[transactionIndex] = updatedTransaction;
  }

  if (userTransactions.categorySummaries[oldYear]?.[oldCategory]) {
    const oldCategorySummary =
      userTransactions.categorySummaries[oldYear][oldCategory];
    const oldMonthlyBreakdown = oldCategorySummary.monthlyBreakdown[oldMonth];

    if (oldMonthlyBreakdown) {
      oldMonthlyBreakdown.monthlySpend -= oldAmount;
      oldMonthlyBreakdown.transactionCount -= 1;
      oldMonthlyBreakdown.lastUpdated = now.toISOString();

      oldCategorySummary.yearlySpend -= oldAmount;
    }
  }

  if (!userTransactions.categorySummaries[newYear]) {
    userTransactions.categorySummaries[newYear] = {};
  }

  if (!userTransactions.categorySummaries[newYear][data.category]) {
    userTransactions.categorySummaries[newYear][data.category] = {
      yearlySpend: 0,
      monthlyBreakdown: {},
    };
  }

  const newCategorySummary =
    userTransactions.categorySummaries[newYear][data.category];

  if (!newCategorySummary.monthlyBreakdown[newMonth]) {
    newCategorySummary.monthlyBreakdown[newMonth] = {
      monthlySpend: 0,
      transactionCount: 0,
      lastUpdated: now.toISOString(),
    };
  }

  const newMonthlyBreakdown = newCategorySummary.monthlyBreakdown[newMonth];
  newMonthlyBreakdown.monthlySpend += data.amount;
  newMonthlyBreakdown.transactionCount += 1;
  newMonthlyBreakdown.lastUpdated = now.toISOString();

  newCategorySummary.yearlySpend += data.amount;

  userTransactions.markModified("transactions");
  userTransactions.markModified("categorySummaries");

  await userTransactions.save();

  res.status(StatusCodes.OK).json({
    message: "Transaction updated successfully",
    transaction: updatedTransaction,
    moved: dateChanged,
  });
};
