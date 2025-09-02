import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();

// Endpoint: GET /product?ean=7891150059870
app.get("/product", async (req, res) => {
  const ean = req.query.ean as string;
  if (!ean) return res.status(400).json({ error: "Missing ean" });

  try {
    const response = await axios.get("https://www.ean-search.org/", {
      params: { q: ean },
      headers: { "User-Agent": "Mozilla/5.0" }, // mimic browser
    });

    const $ = cheerio.load(response.data);

    // Extract product name from the first <p><b><a>
    const productName = $("p b a").first().text().trim();

    res.json({
      ean,
      product: productName || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.listen(5000, () => {
  console.log("API server running on http://localhost:5000");
});
