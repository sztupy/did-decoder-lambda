import http from "node:http";
import express from "express";
import apiRouter from "./api.js";

const app = express();

app.use(express.json());
app.use("/api", apiRouter);

const server = http.createServer(app);
const port = parseInt(process.env.PORT ?? "3000", 10);

server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`listening on: ${bind}`);
});

process.on("SIGTERM", () => server.close());

() => server.listen(port);
