import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  saveRefreshToken,
  findRefreshTokenByUserId,
  deleteRefreshToken,
} from "../models/refreshToken.model.js";

/** Génère un refresh token aléatoire */
export function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

/** Stocke le hash du token */
export async function storeRefreshToken(userId, refreshToken) {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  return saveRefreshToken(userId, tokenHash);
}

/** Vérifie le refresh token */
export async function verifyRefreshToken(userId, incomingToken) {
  const stored = await findRefreshTokenByUserId(userId);
  if (!stored) return false;

  const isValid = await bcrypt.compare(incomingToken, stored.token_hash);
  return isValid ? stored : false;
}

/** Supprime le refresh token (logout) */
export async function removeRefreshToken(userId) {
  return deleteRefreshToken(userId);
}
