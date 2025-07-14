import type { Request, Response } from "express";
import { CardModel } from "../models/Card";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/custom-errors";
import { Card } from "../types/types";
import mongoose from "mongoose";

export const getCards = async (req: Request, res: Response): Promise<void> => {
  const { clerkId } = req.params;

  const userCards = await CardModel.findOne({ clerkId });

  res.status(StatusCodes.OK).json(userCards);
};

export const createCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;
  const data = req.body;

  const now = new Date();

  const userCards = await CardModel.findOne({ clerkId });

  if (!userCards) {
    throw NotFoundError(`There are no cards for user with id: ${clerkId}`);
  }

  const newCard: Card = {
    _id: new mongoose.Types.ObjectId().toString(),
    bankName: data.bankName,
    cardType: data.cardType,
    lastFourDigits: data.lastFourDigits,
    cardholderName: data.cardholderName,
    color: data.color,
    isDefault: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    _v: 0,
  };

  userCards.cards.push(newCard);

  await userCards.save();

  res.status(StatusCodes.CREATED).json({
    message: "Card created successfully",
    card: newCard,
  });
};

export const updateCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;
  const data = req.body;

  const now = new Date();

  const userCards = await CardModel.findOne({ clerkId });

  if (!userCards) {
    throw NotFoundError(`There are no cards for user with id: ${clerkId}`);
  }

  const updatedCard = await CardModel.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        "cards.$[card].bankName": data.bankName,
        "cards.$[card].type": data.cardType,
        "cards.$[card].lastFourDigits": data.lastFourDigits,
        "cards.$[card].cardholderName": data.cardholderName,
        "cards.$[card].color": data.color,
        "cards.$[card].updatedAt": now.toISOString(),
      },
      $inc: { "cards.$[card]._v": 1 },
    },
    {
      arrayFilters: [{ "card._id": data._id }],
      new: true,
    }
  );

  res.status(StatusCodes.OK).json({
    message: "Card updated successfully",
    card: updatedCard,
  });
};

export const deleteCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;
  const data = req.body;

  const result = await CardModel.findOneAndUpdate(
    { clerkId },
    { $pull: { cards: { _id: data._id } } }
  );

  res.status(StatusCodes.OK).json({
    message: "Card deleted successfully",
    cards: result,
  });
};
