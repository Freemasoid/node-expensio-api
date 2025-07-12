import mongoose, { Document, Schema } from "mongoose";

export interface CardDocument extends Document {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  cards: {
    _id: string;
    bankName: string;
    cardType: "credit" | "debit";
    lastFourDigits: string;
    cardholderName: string;
    color: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    _v: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  _v: number;
}

const cardSchema = new Schema<CardDocument>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    cards: [
      {
        bankName: {
          type: String,
          required: true,
        },
        cardType: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },
        lastFourDigits: {
          type: String,
          required: true,
        },
        cardholderName: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: String,
          required: true,
        },
        _v: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

export const CardModel = mongoose.model<CardDocument>("Card", cardSchema);
