import mongoose, { Document, Schema } from "mongoose";

export interface UserCategoriesDocument extends Document {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userCategoriesSchema = new Schema<UserCategoriesDocument>(
  {
    clerkId: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const UserCategoriesModel = mongoose.model<UserCategoriesDocument>(
  "Categories",
  userCategoriesSchema
);
