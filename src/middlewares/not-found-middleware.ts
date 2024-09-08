import { Request, Response, NextFunction } from "express";

export default function notFound(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return res
    .status(404)
    .json({ error: "The route you search for does not exist" });
}
