import express from "express";
import {
  addBook,
  deleteBook,
  editBook,
  getAllBooks,
  getSingleBook,
} from "../controllers/book-controller";
import { authorizeUser, checkOwnership } from "../middlewares/auth-middleware";

/* --------------------------- Schema Informations -------------------------- */
/**
 * @swagger
 * components:
 *  schemas:
 *    Book:
 *      type: object
 *      required:
 *        - title
 *        - author
 *      properties:
 *        id:
 *          type: string
 *          description: The auto-generated ID of the book
 *        title:
 *          type: string
 *          description: The title of the book
 *        author:
 *          type: string
 *          description: The book author
 *        createdAt:
 *          type: string
 *          format: date
 *          description: The date the book was added
 *      example:
 *        id: 1725426103540
 *        title: Mobby Dick
 *        author: Herman Melville
 *        createdAt: 2024-09-04T05:01:43.540Z
 */

/* -------------------------- Endpoint Informations ------------------------- */
/**
 * @swagger
 * tags:
 *  name: Books
 *  description: The books managing API
 * /books:
 *  post:
 *    summary: Add new book
 *    tags: [Books]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/Book"
 *    responses:
 *      201:
 *        description: The created book
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Book"
 *      500:
 *        description: General server error
 *
 */

const router = express.Router();

router.route("/").get(authorizeUser("admin"), getAllBooks).post(addBook);
router
  .route("/:id")
  .all(checkOwnership)
  .get(getSingleBook)
  .put(editBook)
  .delete(deleteBook);

export default router;
