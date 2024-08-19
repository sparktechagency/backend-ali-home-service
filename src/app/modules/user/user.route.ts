import { Router } from "express";
import { userControllers } from "./user.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "./user.constant";
import fileUpload from "../../middleware/fileUpload";
import parseData from "../../middleware/parseData";
const upload = fileUpload("./public/uploads/profile/");
const router = Router();
router.post(
  "/create-user",
  // upload.single("file"),
  // parseData(),
  userControllers.insertuserIntoDb
);
router.post(
  "/create-vendor",
  upload.single("file"),
  parseData(),
  userControllers.insertVendorIntoDb
);
router.patch(
  "/update/:id",
  auth(USER_ROLE.admin),
  upload.single("file"),
  parseData(),
  userControllers.updateUser
);
router.patch(
  "/",
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.vendor),
  upload.single("file"),
  parseData(),
  userControllers.updateProfile
);
router.get(
  "/all",
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  userControllers.getAllUsers
);
router.get(
  "/",
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.vendor),
  userControllers.getme
);

router.get(
  "/:id",
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  userControllers.getsingleUser
);
router.patch(
  "/update/:id",
  auth(USER_ROLE.admin),
  upload.single("file"),
  parseData(),
  userControllers.updateUser
);
router.patch(
  "/:id",
  auth(USER_ROLE.user),
  upload.single("file"),
  parseData(),
  userControllers.updateProfile
);
router.delete(
  "/",
  auth(USER_ROLE.vendor, USER_ROLE.user),
  userControllers.deleteAccount
);
export const userRoutes = router;
