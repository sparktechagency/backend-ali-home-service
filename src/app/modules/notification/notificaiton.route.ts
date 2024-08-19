import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { notificationControllers } from "./notification.controller";

const router = Router();
// router.post("/",)
router.get(
  "/",
  auth(USER_ROLE.vendor, USER_ROLE.admin, USER_ROLE.user),
  notificationControllers.getAllNotification
);
router.patch(
  "/",
  auth(USER_ROLE.vendor, USER_ROLE.admin, USER_ROLE.user),
  notificationControllers.markAsDone
);

export const notificationRoutes = router;
