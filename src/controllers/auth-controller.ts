import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import crypto from "crypto";
import { hash, genSalt, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // #swagger.tags = ['Authentication']
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const emailRecord = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (emailRecord)
      return res.status(400).json({ error: "Email already been used" });

    const userRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    const salt = await genSalt(10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: await hash(password, salt),
        roleId: userRole!.id,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const confirmationLink = `http://localhost:${process.env.PORT}/api/v1/auth/confirm-email?token=${token}`;

    await prisma.registrationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    const { data, error } = await resend.emails.send({
      from: "Express CRUD <tutorial@killthemagic.dev>",
      to: [email],
      subject: "Express CRUD Confirmation",
      html: `<p>Please confirm your email using this <a href=${confirmationLink}>link.</a> Thank you!<p>`,
    });

    if (error) return res.status(400).json({ error });

    return res.status(200).json({ message: "OK", data });
  } catch (error) {
    return next(error);
  }
}

export async function confirmEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // #swagger.tags = ['Authentication']
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: "No token provided" });

    const tokenRecord = await prisma.registrationToken.findUnique({
      where: { token: token.toString() },
    });

    if (
      !tokenRecord ||
      tokenRecord.expiresAt < new Date() ||
      tokenRecord.isTokenUsed
    )
      return res.status(400).json({ error: "Invalid or expired token" });

    await prisma.registrationToken.update({
      where: { id: tokenRecord.id },
      data: { isTokenUsed: true },
    });

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isEmailConfirmed: true },
    });

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  // #swagger.tags = ['Authentication']
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: { Role: true },
    });

    if (!user || !user.isEmailConfirmed)
      return res.status(404).json({
        error: "Unconfirmed email or user not found",
      });

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword)
      return res.status(400).json({
        error: "Invalid credentials",
      });

    const jwtPayload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.Role.name,
    };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY as string, {
      expiresIn: "30d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({ message: "OK" });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  // #swagger.tags = ['Authentication']
  try {
    res.clearCookie("token");
    req.user = null;

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    return next(error);
  }
}
