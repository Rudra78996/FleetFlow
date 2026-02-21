import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Auth me error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, currentPassword, newPassword } = body;

        const existingUser = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Handle password change
        if (currentPassword && newPassword) {
            const isValidPassword = await verifyPassword(currentPassword, existingUser.password);
            if (!isValidPassword) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
            }

            const hashedPassword = await hashPassword(newPassword);
            await prisma.user.update({
                where: { id: payload.userId },
                data: { password: hashedPassword },
            });

            return NextResponse.json({ message: "Password updated successfully" });
        }

        // Handle profile update
        const updateData: { name?: string; email?: string } = {};
        
        if (name && name.trim()) {
            updateData.name = name.trim();
        }
        
        if (email && email.trim()) {
            // Check if email is already taken by another user
            const emailTaken = await prisma.user.findFirst({
                where: { 
                    email: email.trim(),
                    NOT: { id: payload.userId }
                },
            });
            
            if (emailTaken) {
                return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
            }
            
            updateData.email = email.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: payload.userId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
