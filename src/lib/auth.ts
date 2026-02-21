import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fleetflow-secret-key-change-in-production";

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    name: string;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    const cookieToken = request.cookies.get("token")?.value;
    return cookieToken || null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}

export const ROLES = {
    FLEET_MANAGER: "FLEET_MANAGER",
    DISPATCHER: "DISPATCHER",
    SAFETY_OFFICER: "SAFETY_OFFICER",
    FINANCIAL_ANALYST: "FINANCIAL_ANALYST",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
