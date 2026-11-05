import { Router } from "express";
import { z } from "zod";
import Party from "../models/Party.js";
import Item from "../models/Item.js";
import Transaction from "../models/Transaction.js";
import { snapshot, resetUserData, handleIntent } from "../services/actions.js";
import { validateBody } from "../middleware/validate.js";
const r = Router();
r.get("/parties", async (req, res, next) => {
  try {
    res.json(await Party.find({ user: req.userId }).sort({ name: 1 }).lean());
  } catch (e) {
    next(e);
  }
});
r.get("/items", async (req, res, next) => {
  try {
    res.json(await Item.find({ user: req.userId }).sort({ name: 1 }).lean());
  } catch (e) {
    next(e);
  }
});
r.get("/transactions", async (req, res, next) => {
  try {
    res.json(
      await Transaction.find({ user: req.userId })
        .populate("party", "name")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    );
  } catch (e) {
    next(e);
  }
});
r.get("/to-buy", async (req, res, next) => {
  try {
    res.json(await Item.find({ user: req.userId, toBuy: true }).lean());
  } catch (e) {
    next(e);
  }
});
r.post("/undo", async (req, res, next) => {
  try {
    const result = await handleIntent(req.userId, { intent: "undo_last" });
    res.json({ ...result, snapshot: await snapshot(req.userId) });
  } catch (e) {
    next(e);
  }
});
r.post(
  "/demo/reset",
  validateBody(z.object({ confirm: z.literal(true) }).strict()),
  async (req, res, next) => {
    try {
      await resetUserData(req.userId);
      res.json({ ok: true, snapshot: await snapshot(req.userId) });
    } catch (e) {
      next(e);
    }
  },
);
export default r;
