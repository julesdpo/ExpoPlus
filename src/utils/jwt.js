import jwt from "jsonwebtoken";
import crypto from "crypto";

export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function generateRefreshToken() {
  // refresh = random string, pas un JWT !
  return crypto.randomBytes(64).toString("hex");
}
