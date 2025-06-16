import mongoose, { Document, Schema } from "mongoose";

export interface TransactionDocument extends Document {
  title: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  date: string;
  description: string;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return !isNaN(Date.parse(v));
        },
        message: "Date must be a valid ISO string",
      },
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });

export const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema
);
