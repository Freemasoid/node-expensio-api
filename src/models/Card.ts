import mongoose, { Document, Schema } from "mongoose";

export interface CardDocument extends Document {
  name: string;
  lastFourDigits: string;
  type: "credit" | "debit";
  color: string;
  isDefault: boolean;
}

const cardSchema = new Schema<CardDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    lastFourDigits: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
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
  },
  { timestamps: true }
);

export const CardModel = mongoose.model<CardDocument>("Card", cardSchema);
