import express from "express";
import {
  editUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
} from "../controllers/user-controller";
import { authorizeUser, checkOwnership } from "../middlewares/auth-middleware";

const router = express.Router();

router.route("/").get(authorizeUser("admin"), getAllUsers);
router
  .route("/:id")
  .get(getSingleUser)
  .put(checkOwnership, editUser)
  .delete(checkOwnership, deleteUser);

export default router;
