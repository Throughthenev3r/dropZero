import "dotenv/config";
import express from "express";
import routes from "./routes/index.js";
import db from "./db/database.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(routes);

console.log("DB ok", db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());


app.listen(PORT, () => {
  console.log(`Server running at ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
