import type { Request, Response } from "express";
import { UserCategoriesModel } from "../models/UserCategories";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/custom-errors";

const defaultCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Travel",
  "Housing",
  "Utilities",
  "Insurance",
  "Investment",
  "Salary",
  "Freelance",
  "Gifts",
];

export const createUserCategoriesDocument = async (clerkId: string) => {
  return await UserCategoriesModel.create({
    clerkId: clerkId,
    defaultCategories,
  });
};

export const getUserCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;

  const userCategories = await UserCategoriesModel.findOne({
    clerkId: clerkId,
  });

  if (!userCategories) {
    throw BadRequestError(`No categories found for user: ${clerkId}`);
  }

  res.status(StatusCodes.OK).json(userCategories);
};

export const addUserCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;
  let { category } = req.body;

  category = category.trim();

  if (!category || typeof category !== "string" || category.trim() === "") {
    throw BadRequestError("Category is required and must be non-empty string");
  }

  const userCategories = await UserCategoriesModel.findOne({
    clerkId: clerkId,
  });

  if (!userCategories) {
    throw BadRequestError(`No categories found for user: ${clerkId}`);
  }

  if (userCategories.categories.includes(category.trim())) {
    res.status(StatusCodes.OK).json(userCategories);
  }

  userCategories.categories.push(category);

  await userCategories.save();

  res.status(StatusCodes.OK).json(userCategories);
};

export const deleteUserCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clerkId } = req.params;
  let { category } = req.body;

  category = category.trim();

  if (!category || typeof category !== "string" || category === "") {
    throw BadRequestError("Category is required and must be non-empty string");
  }

  const userCategories = await UserCategoriesModel.findOne({
    clerkId: clerkId,
  });

  if (!userCategories) {
    throw BadRequestError(`No categories found for user: ${clerkId}`);
  }

  if (!userCategories.categories.includes(category)) {
    throw BadRequestError("There is no such category");
  }

  const filteredCategories = userCategories.categories.filter(
    (value) => value !== category
  );

  userCategories.categories = filteredCategories;

  await userCategories.save();

  res.status(StatusCodes.OK).json(userCategories);
};
