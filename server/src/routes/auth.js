import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";
import { signToken, cookieOptions, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
const r = Router();
const loginSchema = z
  .object({
    username: z.string().trim().min(1).max(40),
    password: z.string().min(1).max(200),
  })
  .strict();
r.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const u = await User.findOne({
      username: req.validatedBody.username.toLowerCase(),
    });
    if (
      !u ||
      !(await bcrypt.compare(req.validatedBody.password, u.passwordHash))
    )
      return res
        .status(401)
        .json({
          error: {
            code: "LOGIN_FAILED",
            message: "Username ya password galat hai",
          },
        });
    res
      .cookie("munshi_token", signToken(u), cookieOptions())
      .json({ user: { username: u.username } });
  } catch (e) {
    next(e);
  }
});
r.post("/logout", (req, res) =>
  res
    .clearCookie("munshi_token", { ...cookieOptions(), maxAge: undefined })
    .json({ ok: true }),
);
r.get("/me", requireAuth, async (req, res, next) => {
  try {
    const u = await User.findById(req.userId).select("username");
    if (!u)
      return res
        .status(401)
        .json({ error: { code: "UNAUTHENTICATED", message: "Login again" } });
    res.json({ user: { username: u.username } });
  } catch (e) {
    next(e);
  }
});
export default r;
