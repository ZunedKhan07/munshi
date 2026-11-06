
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";

import User from "./models/User.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import voiceRoutes from "./routes/voice.js";
import dataRoutes from "./routes/data.js";
import { requireAuth } from "./middleware/auth.js";
import {
  requestLogger,
  notFound,
  errorHandler,
} from "./middleware/errors.js";

// Validate required environment variables
const required = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLIENT_ORIGIN",
  "GNANI_API_KEY",
  "GEMINI_API_KEY",
  "DEMO_USERNAME",
  "DEMO_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY || 0));

// Security and middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN.split(",").map((x) => x.trim()),
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use(morgan("tiny", {
  skip: () => process.env.NODE_ENV === "production",
}));

// Global API rate limiter
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: {
          code: "RATE_LIMIT",
          message: "Too many requests. Thodi der baad try karein.",
        },
      });
    },
  }),
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "munshi" });
});

// Login-specific rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: "LOGIN_RATE_LIMIT",
        message: "Login attempts zyada ho gaye. 15 minute baad try karein.",
      },
    });
  },
});

// Apply login limiter only to login endpoint
app.use("/api/auth/login", loginLimiter);

// Public authentication routes: login, me, logout
app.use("/api/auth", authRoutes);

// Protect all remaining API routes
app.use("/api", requireAuth);

// Protected application routes
app.use("/api/voice", voiceRoutes);
app.use("/api", dataRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const port = Number(process.env.PORT || 5000);

await connectDB(process.env.MONGODB_URI);

// Create demo user if it does not exist
const username = process.env.DEMO_USERNAME.toLowerCase();

let demo = await User.findOne({ username });

if (!demo) {
  demo = await User.create({
    username,
    passwordHash: await bcrypt.hash(process.env.DEMO_PASSWORD, 12),
  });

  console.log("Demo user created");
} else if (process.env.RESET_DEMO_PASSWORD === "true") {
  demo.passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD, 12);
  await demo.save();

  console.log("Demo password reset");
}

app.listen(port, () => {
  console.log(` ✅ Munshi API listening on port ${port}`);
});
