import type { Request, Response } from "express";
import { TransactionModel } from "../models/Transaction";
import { NotFoundError } from "../errors/custom-errors";
import { StatusCodes } from "http-status-codes";

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
