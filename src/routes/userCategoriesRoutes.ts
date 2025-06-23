import express from "express";
import {
  getUserCategories,
  addUserCategory,
  deleteUserCategory,
} from "../controllers/userCategoriesController";

const router = express.Router();

router.get("/:clerkId", getUserCategories);

router.post("/:clerkId", addUserCategory);

router.delete("/:clerkId", deleteUserCategory);

export default router;
