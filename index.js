require("dotenv").config();
const express = require("express");
const dns = require("dns");
const cors = require("cors");
const { urlencoded } = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

let urls = [];

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  const originalURL = req.body.url;
  console.log(req.body);
  if (!originalURL)
    return res.status(400).json({ error: "Missing parameter 'original_url'" });
  dns.lookup(
    originalURL.replace("https://", "").replace("http://", ""),
    (err, address, family) => {
      if (err) {
        console.log(err);
        return res.json({ error: "invalid url" });
      }
      const shortenedURL = urls.length;
      urls.push({
        originalURL: originalURL,
        shortenedURL: shortenedURL,
      });
      return res.json({
        original_url: originalURL,
        short_url: shortenedURL,
      });
    }
  );
});

app.get("/api/shorturl/:id", function (req, res) {
  const { id } = req.params;
  const url = urls[id];
  if (!url) return res.status(404).json({ error: "Not Found" });
  return res.redirect(
    "https://" + url.originalURL.replace("https://", "").replace("http://", "")
  );
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
