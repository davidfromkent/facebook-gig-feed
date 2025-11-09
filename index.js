const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const Tesseract = require("tesseract.js");

const app = express();

app.get("/", (req, res) => res.send("Facebook Gig Feed is running with OCR support"));

app.get("/facebook", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing ?id parameter");

  const url = `https://mbasic.facebook.com/${id}`;
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const posts = [];

    // loop through posts
    const articles = $("article").slice(0, 5); // first 5 posts
    for (const el of articles) {
      const text = $(el).text();
      const image = $(el).find("img").attr("src");
      let ocrText = "";

      if (image) {
        try {
          const ocr = await Tesseract.recognize(image, "eng");
          ocrText = ocr.data.text;
        } catch (err) {
          console.log("OCR failed for an image");
        }
      }

      const combinedText = (text + " " + ocrText).toLowerCase();
      if (
        combinedText.includes("live") ||
        combinedText.includes("gig") ||
        combinedText.includes("band") ||
        combinedText.includes("dj") ||
        combinedText.includes("music")
      ) {
        posts.push({
          text: text.slice(0, 200),
          ocr: ocrText.slice(0, 100),
          image
        });
      }
    }

    res.json({ venue: id, results: posts });
  } catch (err) {
    res.status(500).send("Error fetching or processing page");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
