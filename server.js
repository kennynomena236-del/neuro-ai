const express = require("express");
const app = express();

app.use(express.json());

let validCodes = ["VIP-12345", "VIP-67890"];

app.post("/check-vip", (req, res) => {
  const { code } = req.body;

  if (validCodes.includes(code)) {
    return res.json({ success: true, vip: true });
  }

  res.json({ success: false, vip: false });
});

app.get("/", (req, res) => {
  res.send("Server VIP running 🚀");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
