import { PrismaClient, Prisma } from "@prisma/client";
import { genSalt, hash } from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  try {
    const salt = await genSalt(10);

    const adminRole = await prisma.role.create({
      data: { name: "admin" },
    });

    const userRole = await prisma.role.create({
      data: { name: "user" },
    });

    await prisma.user.createMany({
      data: [
        {
          fullName: "Admin",
          email: "admin@email.com",
          isEmailConfirmed: true,
          password: await hash("adminpass", salt),
          roleId: adminRole.id,
        },
        {
          fullName: "Jane Smith",
          email: "jane.smith@email.com",
          isEmailConfirmed: true,
          password: await hash("janepass", salt),
          roleId: userRole.id,
        },
        {
          fullName: "Michael Johnson",
          email: "michael.johnson@email.com",
          isEmailConfirmed: true,
          password: await hash("michaelpass", salt),
          roleId: userRole.id,
        },
        {
          fullName: "John Doe",
          email: "john.doe@email.com",
          isEmailConfirmed: true,
          password: await hash("johnpass", salt),
          roleId: userRole.id,
        },
      ],
    });

    await prisma.book.createMany({
      data: [
        { title: "Moby Dick", author: "Herman Melville", userId: 2 },
        { title: "Pride and Prejudice", author: "Jane Austen", userId: 2 },
        { title: "1984", author: "George Orwell", userId: 3 },
        { title: "To Kill a Mockingbird", author: "Harper Lee", userId: 3 },
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", userId: 3 },
        { title: "War and Peace", author: "Leo Tolstoy", userId: 4 },
        { title: "The Catcher in the Rye", author: "J.D. Salinger", userId: 4 },
        { title: "Brave New World", author: "Aldous Huxley", userId: 4 },
        { title: "The Hobbit", author: "J.R.R. Tolkien", userId: 4 },
        {
          title: "Crime and Punishment",
          author: "Fyodor Dostoevsky",
          userId: 4,
        },
      ],
    });

    console.log("Seed data successfully inserted");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
