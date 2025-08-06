# Create server.js in your project folder
echo 'const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Your API keys (secure on your local machine)
const CLAUDE_API_KEY = "your-actual-claude-key-here";

app.post("/api/claude", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229", 
        max_tokens: 1000,
        messages: [{ role: "user", content: req.body.query }]
      })
    });
    
    const data = await response.json();
    res.json({ success: true, response: data.content[0].text });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));' > server.js