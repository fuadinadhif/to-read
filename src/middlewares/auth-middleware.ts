import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.cookies;

    if (!token) return res.status(400).json({ error: "Please login first" });

    const tokenPayload = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as Request["user"];

    if (!tokenPayload)
      return res.status(401).json({ error: "Invalid or expired token" });

    req.user = {
      id: tokenPayload.id,
      fullName: tokenPayload.fullName,
      email: tokenPayload.email,
      roleId: tokenPayload.roleId,
      roleName: tokenPayload.roleName,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorizeUser(...roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!roles.includes(req.user?.roleName!))
        return res.status(403).json({ error: "Access denied" });

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export async function checkOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.user?.roleName === "admin") return next();

    const { id } = req.params;
    const path = req.originalUrl.split("/")[3];

    if (path === "books") {
      const book = await prisma.book.findUnique({
        where: { id: Number(id) },
        include: { User: true },
      });

      if (req.user?.id !== book?.User.id)
        return res.status(403).json({ error: "Access denied" });
    }

    if (path === "users") {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (req.user?.id !== user?.id)
        return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    next(error);
  }
}
