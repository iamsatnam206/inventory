import express, { Application } from "express";
import morgan from "morgan";
import Router from "./routes";
import swaggerUi from "swagger-ui-express";
const cors = require("cors");

require("dotenv").config();

// connect to mongodb
require("./config/mongoConnection");

const PORT = process.env.PORT;

const app: Application = express();

const middleware = [
    express.static("public"),
    express.json({ type: "application/json" }),
    express.urlencoded({ extended: true }),
    express.raw(),
    morgan(`dev`),
    cors(),
];

app.use(middleware);

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        swaggerOptions: {
            url: "/swagger.json",
        },
    })
);

app.use(Router);
console.log(process.env.PORT);

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});