import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a session token (JWT-like format)
 */
export function createSessionToken(userId: number, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString("base64");

  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "default-secret")
    .update(`${header}.${payload}`)
    .digest("base64");

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify a session token
 */
export function verifySessionToken(token: string): { userId: number; email: string } | null {
  try {
    const [header, payload, signature] = token.split(".");

    if (!header || !payload || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "default-secret")
      .update(`${header}.${payload}`)
      .digest("base64");

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());

    // Check expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.error("[Auth] Error verifying token:", error);
    return null;
  }
}
