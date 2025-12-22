import { NextRequest, NextResponse } from "next/server";

import {registerSchema} from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = registerSchema.parse(body);



    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: registerSchema.safeParse(body).error }, { status: 400 });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: registerSchema.safeParse(body).error }, { status: 400 });
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json({ error: registerSchema.safeParse(body).error }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: registerSchema.safeParse(body).error }, { status: 400 });
      }
      return NextResponse.json({ error: registerSchema.safeParse(body).error }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create user and stream in a transaction
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
        stream: {
          create: {
            name: `${username}'s stream`,
          },
        },
      },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
