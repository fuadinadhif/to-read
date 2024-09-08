import "dotenv/config";
import express from "express";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth-route";
import bookRoute from "./routes/book-route";
import userRoute from "./routes/user-route";
import { authenticateUser } from "./middlewares/auth-middleware";
import errorMiddleware from "./middlewares/error-middleware";
import notFoundMiddleware from "./middlewares/not-found-middleware";

const PORT = process.env.PORT || 8000;
const app = express();
const APIDocs = YAML.load("./api-docs.yaml");

app.use(express.json());
app.use(cookieParser());

import swaggerDocument from "./docs/swagger-output.json";

app.use("/api/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/books", authenticateUser, bookRoute);
app.use("/api/v1/users", authenticateUser, userRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
