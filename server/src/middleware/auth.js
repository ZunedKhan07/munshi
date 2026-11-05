import jwt from "jsonwebtoken";
export function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
}
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}
export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.munshi_token;
    if (!token)
      return res
        .status(401)
        .json({ error: { code: "UNAUTHENTICATED", message: "Please login" } });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch {
    return res
      .status(401)
      .json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Session expired. Login again.",
        },
      });
  }
}
