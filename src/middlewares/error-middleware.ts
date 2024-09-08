import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
}

export default function error(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const defaultError = {
    statusCode: error.statusCode || 500,
    message: error.message || "General server error. Good luck!",
  };

  console.error(error);

  return res
    .status(defaultError.statusCode)
    .json({ error: defaultError.message });
}
