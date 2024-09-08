import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllBooks(req: Request, res: Response) {
  // #swagger.tags = ['Book']
  try {
    const books = await prisma.book.findMany();
    return res.status(200).json({ message: "OK", data: books });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export async function getSingleBook(req: Request, res: Response) {
  // #swagger.tags = ['Book']
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: {
        id: Number(id),
      },
      include: { User: true },
    });

    if (!book)
      return res
        .status(404)
        .json({ error: `Book with ID: ${id} is not exist` });

    return res.status(200).json({ message: "OK", data: book });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export async function addBook(req: Request, res: Response) {
  // #swagger.tags = ['Book']
  try {
    const { title, author } = req.body;

    if (!title || !author)
      return res.status(400).json({ error: "Required fields is missing" });

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        userId: req.user!.id as number,
      },
    });

    return res.status(201).json({ message: "OK", data: newBook });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export async function editBook(req: Request, res: Response) {
  // #swagger.tags = ['Book']
  try {
    const { id } = req.params;
    const { title, author, finished } = req.body;

    const book = await prisma.book.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        author,
        finished,
      },
    });

    return res.status(200).json({ message: "OK", data: book });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export async function deleteBook(req: Request, res: Response) {
  // #swagger.tags = ['Book']
  try {
    const { id } = req.params;

    await prisma.book.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}
