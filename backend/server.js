const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const app = express();
app.use(cors());
app.use(express.json());

// Deserveste imaginile static
app.use("/images", express.static(path.join(__dirname, "images")));

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

// DATE INIȚIALE (stocate în memorie). În producție, acestea vor fi
// stocate într-o bază de date

let quotes = [
  {
    id: 1,
    author: "Socrates",
    quote: "The only true wisdom is in knowing you know nothing.",
  },
  {
    id: 2,
    author: "Albert Einstein",
    quote:
      "Life is like riding a bicycle. To keep your balance you must keep moving.",
  },
];

// GET /api/quotes - Returnează lista completă a citatelor. Statusul 200
// (OK) este implicit, dar îl adaugam ca bune practici

//app.get("/api/quotes", (req, res) => {
//res.status(200).json(quotes);
//});

// POST /api/quotes - Adaugă un citat nou trimis în corpul cererii
// (req.body). Clientul trebuie să trimită: { "author": "...", "quote": "..."}. Răspundem cu statusul 201 (Created) și obiectul nou creat.

// app.post("/api/quotes", (req, res) => {
//   const { author, quote } = req.body;
//   const newQuote = {
//     id: quotes.length + 1, // Generăm un ID unic
//     author,
//     quote
//   };
//   quotes.push(newQuote);
//   res.status(201).json(newQuote);
// });

// PUT /api/quotes/:id - Actualizează citatul cu ID-ul specificat în URL.
// `:id` este un parametru dinamic, accesibil prin req.params.id.

// app.put("/api/quotes/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const { author, quote } = req.body;

//   const index = quotes.findIndex(q => q.id === id);

//   if (index === -1) {
//     // 404 Not Found - citatul cu ID-ul respectiv nu există
//     return res.status(404).json({ message: "Citatul nu a fost găsit." });
//   }

//   // Actualizăm intrarea păstrând ID-ul neschimbat
//   quotes[index] = { id, author, quote };
//   res.status(200).json(quotes[index]);
// });

// DELETE /api/quotes/:id - Șterge citatul cu ID-ul specificat din array;
// splice() elimină elementul direct din memorie.

// app.delete("/api/quotes/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const index = quotes.findIndex(q => q.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: "Citatul nu a fost găsit." });
//   }

//   quotes.splice(index, 1);
//   res.status(200).json({ message: "Citatul a fost șters cu succes." });
// });

// Limitare - Datele sunt stocate exclusiv în memorie. La fiecare repornire a serverului, modificările se pierd
// și lista revine la valorile inițiale. Într-o aplicație reală, se folosește o bază de date (MongoDB, PostgreSQL etc.) pentru persistență.

const JSON_SERVER_URL = "http://localhost:3000/quotes";

// verificam dacă id-ul din PUT și DELETE este un număr valid
const validateId = (req, res, next) => {
  if (isNaN(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Schema Joi pentru validarea citatelor
const quoteSchema = Joi.object({
  author: Joi.string().min(2).required(),
  quote: Joi.string().min(5).required(),
});

// API route placeholder
app.get("/", (req, res) => {
  res.send("Printing Quotes API is running...");
});

// Extragem citatele
app.get("/api/quotes", async (req, res) => {
  try {
    const response = await fetch(JSON_SERVER_URL);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Eroare la preluarea citatelor:", error);
    res.status(500).json({ error: "Nu s-au putut prelua citatele" });
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

    const newQuote = { id: newId.toString(), ...req.body }; // convertim ID-ul in sir pentru a se potrivi cu formatul db.json

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

    // creati un nou obiect cu `id` ca prima cheie
    const reorderedData = {
      id: data.id,
      author: data.author,
      quote: data.quote,
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
    next(error);
  }
});

// Pornim serverul pe portul 5000
const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving static images from: ${path.join(__dirname, "images")}`);
});
