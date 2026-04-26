const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/mysql");

const saltRounds = 10;

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [
      email
    ]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword
    ]);

    return res.status(201).json({ message: "Account created! Please log in." });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [users] = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const accessToken = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET, {
      expiresIn: "15m"
    });

    return res.json({
      accessToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
};

const logout = (_req, res) => {
  return res.json({ message: "Logged out successfully." });
};

module.exports = {
  register,
  login,
  logout
};
