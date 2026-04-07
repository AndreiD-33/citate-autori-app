const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// Directorul unde salvăm imaginile descărcate.
const IMAGES_DIR = path.join(__dirname, "images");

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

// Cream directorul /images dacă nu există deja
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Deserveste imaginile static
app.use("/images", express.static(IMAGES_DIR));

// Ruta de test
app.get("/", (req, res) => {
  res.json({
    message: "Printing Quotes API is running...",
    endpoints: {
      quotes: "/api/quotes",
      health: "/api/health",
    },
  });
});

const JSON_SERVER_URL = "http://localhost:3000/quotes";

// verificam dacă id-ul din PUT și DELETE este un număr valid
const validateId = (req, res, next) => {
  if (isNaN(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Schema Joi pentru validarea citatelor actualizata cu imageUrl
const quoteSchema = Joi.object({
  author: Joi.string().min(2).required(),
  quote: Joi.string().min(5).required(),
  imageUrl: Joi.string().allow("").optional(), // Adăugat din Pasul 7
});

// =========================================================
// RUTA NOUĂ PENTRU IMAGINI (Trebuie să fie înaintea /:id)
// =========================================================
// POST /api/quotes/fetch-image
app.post("/api/quotes/fetch-image", async (req, res) => {
  const { author } = req.body;

  if (!author || !author.trim()) {
    return res
      .status(400)
      .json({ error: "Numele autorului este obligatoriu." });
  }

  try {
    // Formatăm numele autorului pentru URL Wikipedia
    const wikiName = author.trim().replace(/\s+/g, "_");
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`;

    const wikiResponse = await fetch(wikiUrl, {
      headers: {
        "User-Agent": "PrintingQuotesApp/1.0",
      },
    });

    if (!wikiResponse.ok) {
      return res.status(404).json({
        error: `Autorul "${author}" nu a fost găsit pe Wikipedia.`,
      });
    }

    const wikiData = await wikiResponse.json();

    if (!wikiData.thumbnail?.source) {
      return res.status(404).json({
        error: `Nu există imagine disponibilă pentru "${author}" pe Wikipedia.`,
      });
    }

    const imageUrl = wikiData.thumbnail.source;

    // Determinăm extensia fişierului din URL
    const ext = imageUrl.split(".").pop().split("?")[0].toLowerCase();

    // Numele fişierului local
    const fileName = `${author.trim().toLowerCase().replace(/\s+/g, "_")}.${ext}`;
    const filePath = path.join(IMAGES_DIR, fileName);

    // Dacă imaginea a fost descărcată anterior, o returnăm direct
    if (fs.existsSync(filePath)) {
      console.log(`Imagine existentă returnată: ${fileName}`);
      return res.status(200).json({ imageUrl: `/images/${fileName}` });
    }

    // Descărcăm imaginea de la Wikipedia
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      return res.status(500).json({ error: "Nu s-a putut descărca imaginea." });
    }

    // Convertim răspunsul într-un Buffer și scriem pe disc
    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`Imagine salvată: ${fileName}`);

    // Returnăm URL-ul local
    res.status(200).json({ imageUrl: `/images/${fileName}` });
  } catch (error) {
    console.error("Eroare la fetch-image:", error.message);
    res.status(500).json({ error: "Eroare internă la preluarea imaginii." });
  }
});
// =========================================================

// API route placeholder (Preluare citate)
app.get("/api/quotes", async (req, res) => {
  try {
    const response = await fetch(JSON_SERVER_URL);
    const data = await response.json();
    const { search } = req.query;

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      const filtered = data.filter(
        (q) =>
          q.author.toLowerCase().includes(term) ||
          q.quote.toLowerCase().includes(term),
      );
      return res.status(200).json(filtered);
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Eroare la preluarea citatelor:", error.message);
    res.status(500).json({ error: "Nu s-au putut prelua citatele." });
  }
});

// Adauga un nou citat
app.post("/api/quotes", async (req, res) => {
  const { error } = quoteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const response = await fetch(JSON_SERVER_URL);
    const quotes = await response.json();

    // generam un ID numeric (urmatorul numar disponibil)
    const newId =
      quotes.length > 0 ? Math.max(...quotes.map((q) => Number(q.id))) + 1 : 1;

    const newQuote = { id: newId.toString(), ...req.body }; // req.body conține acum și imageUrl (dacă e trimis)

    // trimite la json-server
    const postResponse = await fetch(JSON_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote),
    });

    const data = await postResponse.json();

    res.status(postResponse.status).json(data);
  } catch (error) {
    console.error("Error adding quote:", error);
    res.status(500).json({ error: "Failed to add quote" });
  }
});

// Actualizam un citat
app.put("/api/quotes/:id", validateId, async (req, res) => {
  const { error } = quoteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const quoteId = req.params.id;

    // construiti obiectul actualizat, asigurandu-va ca `id` este prima cheie
    const updatedQuote = { id: quoteId, ...req.body };

    const response = await fetch(`${JSON_SERVER_URL}/${quoteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedQuote),
    });

    // verificam daca exista citatul
    if (!response.ok) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const data = await response.json();

    // creati un nou obiect cu `id` ca prima cheie (includem și imageUrl)
    const reorderedData = {
      id: data.id,
      author: data.author,
      quote: data.quote,
      imageUrl: data.imageUrl || "", // Asigurăm includerea imaginii
    };

    res.status(response.status).json(reorderedData);
  } catch (error) {
    console.error("Error updating quote:", error);
    res.status(500).json({ error: "Failed to update quote" });
  }
});

// Stergem un citat
app.delete("/api/quotes/:id", validateId, async (req, res) => {
  try {
    const quoteId = req.params.id;
    const response = await fetch(`${JSON_SERVER_URL}/${quoteId}`);

    // verificam dacă există citatul
    if (!response.ok) {
      return res.status(404).json({ error: "Quote not found" });
    }

    await fetch(`${JSON_SERVER_URL}/${quoteId}`, { method: "DELETE" });
    res.status(200).json({ message: "Quote deleted successfully" });
  } catch (error) {
    // Express gestionează erorile din middleware, dar am pus un fallback clar aici
    console.error("Error deleting quote:", error);
    res.status(500).json({ error: "Failed to delete quote" });
  }
});

// Pornim serverul pe portul 5000
const PORT = process.env.PORT || 5000; // E bine ca PORT să fie mereu cu majuscule în process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving static images from: ${IMAGES_DIR}`);
});

// POST /api/quotes/generate-quote
app.post("/api/quotes/generate-quote", async (req, res) => {
  const { author } = req.body;
  if (!author || !author.trim()) {
    return res
      .status(400)
      .json({ error: "Numele autorului este obligatoriu." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ești un cunoscator în literatură și filosofie. Generezi citate scurte, inspiraționale și autentice. Răspunzi DOAR cu citatul, fără ghilimele, fără numele autorului, fără explicații suplimentare. Maxim 2 propoziții.",
        },
        {
          role: "user",
          content: `Scrie un citat autentic specific lui ${author.trim()}. Dacă autorul are citate celebre cunoscute, folosește unul dintre ele. Dacă nu, generează unul în stilul și filosofia sa.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const generatedQuote = completion.choices[0].message.content.trim();
    res.status(200).json({ quote: generatedQuote });
  } catch (error) {
    console.error("Eroare OpenAI:", error.message);
    if (error.status === 401) {
      return res.status(500).json({ error: "Cheie API OpenAI invalidă." });
    }
    res.status(500).json({ error: "Nu s-a putut genera citatul." });
  }
});

// POST /api/quotes/author-info
// Primește { author } și returnează o descriere scurtă despre autor, generată de AI.
app.post("/api/quotes/author-info", async (req, res) => {
  const { author } = req.body;

  if (!author || !author.trim()) {
    return res
      .status(400)
      .json({ error: "Numele autorului este obligatoriu." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'Ești un asistent concis care descrie personalități istorice. Răspunzi doar în limba română. Răspunsul conține EXACT doua propoziții scurte. Menționezi: domeniul, perioada și contribuția principală. Fără introduceri, fără "Sigur!", fără explicații extra.',
        },
        {
          role: "user",
          content: `Descrie pe ${author.trim()} în exact 2 propoziții.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.5,
    });

    const info = completion.choices[0].message.content.trim();
    res.status(200).json({ info });
  } catch (error) {
    console.error("Eroare author-info:", error.message);
    res.status(500).json({ error: "Nu s-au putut prelua informațiile." });
  }
});

// POST /api/quotes/author-info
app.post("/api/quotes/author-info", async (req, res) => {
  const { author } = req.body;
  if (!author || !author.trim()) {
    return res
      .status(400)
      .json({ error: "Numele autorului este obligatoriu." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'Ești un asistent concis care descrie personalități istorice. Răspunzi doar în limba română. Răspunsul conține EXACT doua propoziții scurte. Menționezi: domeniul, perioada și contribuția principală. Fără introduceri, fără "Sigur!", fără explicații extra.',
        },
        {
          role: "user",
          content: `Descrie pe ${author.trim()} în exact 2 propoziții.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.5,
    });

    const info = completion.choices[0].message.content.trim();
    res.status(200).json({ info });
  } catch (error) {
    console.error("Eroare author-info:", error.message);
    res.status(500).json({ error: "Nu s-au putut prelua informațiile." });
  }
});
