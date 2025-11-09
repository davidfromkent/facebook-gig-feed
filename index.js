const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();

app.get("/", (req, res) => {
  res.send("Facebook Gig Feed is running");
});

app.get("/facebook", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing ?id parameter");

  const url = `https://mbasic.facebook.com/${id}`;
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const posts = [];
    $("article").each((i, el) => {
      const text = $(el).text();
      const image = $(el).find("img").attr("src");
      if (text.toLowerCase().includes("live") || text.toLowerCase().includes("gig")) {
        posts.push({ text: text.slice(0, 200), image });
      }
    });

    res.json({ venue: id, results: posts.slice(0, 5) });
  } catch (err) {
    res.status(500).send("Error fetching page");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
