const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();

app.get("/", (req, res) => res.send("Google-based Facebook Gig Feed is running"));

// Example: /facebook?id=Half+Moon+and+Seven+Stars
app.get("/facebook", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing ?id parameter");

  // Build Google search URL
  const query = `site:facebook.com "${id}" (live OR gig OR band OR music OR DJ)`;
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    $("a").each((i, el) => {
      const link = $(el).attr("href");
      const title = $(el).find("h3").text();
      const snippet = $(el).parent().find("span").text();
      if (title && link && link.includes("facebook.com")) {
        results.push({
          title: title.slice(0, 120),
          snippet: snippet.slice(0, 200),
          link,
        });
      }
    });

    res.json({ venue: id, count: results.length, results: results.slice(0, 10) });
  } catch (err) {
    res.status(500).send("Error fetching Google results");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
