import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import { hash } from "@node-rs/argon2";
import { Result } from "../signin/route";

export async function POST(request: Request): Promise<NextResponse<Result>> {
  const body = await request.json();
  const { email, password } = body;

  if (
    typeof email !== "string" ||
    email.length < 3 ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  try {
    await prisma.user.create({
      data: {
        email: email,
        password: passwordHash,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log(e);

    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }
}
