import mongoose, { Document, Schema } from "mongoose";

export interface TransactionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  totalSpend: number;
  totalIncome: number;
  transactions: {
    [year: string]: {
      [month: string]: Array<{
        _id: { $oid: string };
        title: string;
        category: string;
        amount: number;
        type: "expense" | "income";
        date: string;
        description?: string;
      }>;
    };
  };
  categorySummaries: {
    [year: string]: {
      [category: string]: {
        yearlySpend: number;
        monthlyBreakdown: {
          [month: string]: {
            monthlySpend: number;
            transactionCount: number;
            lastUpdated: string;
          };
        };
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    clerkId: {
      type: String,
      required: true,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    transactions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    categorySummaries: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

transactionSchema.index({ clerkId: 1 });

// Pre-save hook to mark Mixed fields as modified
transactionSchema.pre("save", function () {
  if (this.isModified("transactions") || this.isNew) {
    this.markModified("transactions");
  }
  if (this.isModified("categorySummaries") || this.isNew) {
    this.markModified("categorySummaries");
  }
});

export const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema
);
