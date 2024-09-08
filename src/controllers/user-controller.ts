import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // #swagger.tags = ['User']
  try {
    const users = await prisma.user.findMany();

    return res.status(200).json({ message: "OK", data: users });
  } catch (error) {
    return next(error);
  }
}

export async function getSingleUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // #swagger.tags = ['User']
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user)
      return res
        .status(404)
        .json({ error: `User with ID: ${id} does not exist` });

    return res.status(200).json({ message: "OK", data: user });
  } catch (error) {
    return next(error);
  }
}

export async function editUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // #swagger.tags = ['User']
  try {
    const { id } = req.params;
    const { fullName } = req.body;

    await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        fullName,
      },
    });

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // #swagger.tags = ['User']
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.clearCookie("token");
    req.user = null;

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    return next(error);
  }
}
