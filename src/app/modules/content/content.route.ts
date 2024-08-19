import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { contentControllers } from "./content.controller";

const router = Router();
router.post("/", auth(USER_ROLE.admin), contentControllers.insertContentIntoDb);
router.get("/", contentControllers.getContent);
export const contentRoues = router;
