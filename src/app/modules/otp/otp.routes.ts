import { Router } from "express";
import { otpControllers } from "./otp.controller";
const router = Router();

router.post("/verify-otp", otpControllers.verifyOtp);
router.post("/resend-otp", otpControllers.resendOtp);

export const otpRoutes = router;
