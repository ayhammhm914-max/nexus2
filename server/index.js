const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const authRoutes = require("./routes/auth.routes");
const { ensureUsersTable } = require("./db/mysql");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

ensureUsersTable()
  .then(() => {
    app.listen(port, () => {
      console.log(`Auth server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize MySQL users table.", error);
    process.exit(1);
  });
