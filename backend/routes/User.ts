import express from "express";

const {
  signup,
    login,
  sendotp,

} =require("../controllers/Auth");

const { auth } = require("../middlewares/auth")

const router = express.Router();

// API routes
router.post("/signup",signup);
router.post("/login", login);
router.post("/sendotp",sendotp);

export default router;