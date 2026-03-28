const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "ultra_secret_key";

let users = [];
let history = [];

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  users.push({ email, password: hashed, vip: false });

  res.json({ message: "User created" });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).send("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send("Wrong password");

  const token = jwt.sign(
    { email: user.email, vip: user.vip },
    SECRET
  );

  res.json({ token, vip: user.vip });
});

// ACTIVER VIP
app.post("/api/vip", (req, res) => {
  const { email } = req.body;

  const user = users.find(u => u.email === email);
  if (user) user.vip = true;

  res.json({ message: "VIP activated" });
});

// FOOTBALL IA
app.post("/api/football", (req, res) => {
  const { odds1, oddsX, odds2 } = req.body;

  const p1 = 1 / odds1;
  const px = 1 / oddsX;
  const p2 = 1 / odds2;

  const total = p1 + px + p2;

  const prob1 = p1 / total;
  const probX = px / total;
  const prob2 = p2 / total;

  let winner = "DRAW";
  let confidence = probX;

  if (prob1 > probX && prob1 > prob2) {
    winner = "TEAM1";
    confidence = prob1;
  } else if (prob2 > prob1 && prob2 > probX) {
    winner = "TEAM2";
    confidence = prob2;
  }

  const result = {
    winner,
    confidence: (confidence * 100).toFixed(2),
    probabilities: {
      team1: (prob1 * 100).toFixed(2),
      draw: (probX * 100).toFixed(2),
      team2: (prob2 * 100).toFixed(2),
    },
  };

  history.push(result);
  res.json(result);
});

// TRADING IA
app.post("/api/trading", (req, res) => {
  const { prices } = req.body;

  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const last = prices[prices.length - 1];

  let signal = "HOLD";

  if (last > avg) signal = "BUY";
  if (last < avg) signal = "SELL";

  const result = {
    signal,
    confidence: Math.abs(last - avg).toFixed(2),
  };

  history.push(result);
  res.json(result);
});

// PROTECTED VIP ROUTE
app.get("/api/protected", (req, res) => {
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, SECRET);

    if (!decoded.vip) {
      return res.status(403).send("VIP only");
    }

    res.json({ message: "Welcome VIP 🔥" });
  } catch {
    res.status(401).send("Invalid token");
  }
});

// STATUS
app.get("/", (req, res) => {
  res.send("API IA + VIP ACTIVE 🚀");
});

app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});
