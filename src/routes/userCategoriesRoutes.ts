import express from "express";
import {
  getUserCategories,
  addUserCategory,
  deleteUserCategory,
  createUserCategoriesDocument,
} from "../controllers/userCategoriesController";

const router = express.Router();

router.post("/:clerkId", createUserCategoriesDocument);

router.get("/:clerkId", getUserCategories);

router.post("/:clerkId", addUserCategory);

router.delete("/:clerkId", deleteUserCategory);

export default router;
