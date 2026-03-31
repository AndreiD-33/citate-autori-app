const fs = require("fs");
const path = require("path");

// Directorul unde salvăm imaginile descărcate.
// path.join asigură compatibilitate cross-platform.
const IMAGES_DIR = path.join(__dirname, "images");

// Cream directorul /images dacă nu există deja
// { recursive: true } previne eroarea dacă directorul există
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// POST /api/quotes/fetch-image
// Primeşte { author } din body, caută pe Wikipedia,
// descarcă imaginea şi o salvează în /images/.
// Returnează URL-ul local al imaginii.
app.post("/api/quotes/fetch-image", async (req, res) => {
  const { author } = req.body;

  if (!author || !author.trim()) {
    return res
      .status(400)
      .json({ error: "Numele autorului este obligatoriu." });
  }

  try {
    // Formatăm numele autorului pentru URL Wikipedia:
    // "Albert Einstein" -> "Albert_Einstein"
    const wikiName = author.trim().replace(/\s+/g, "_");
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`;

    // Cerere către Wikipedia REST API
    // User-Agent este recomandat de Wikipedia pentru identificarea aplicației
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

    // Verificăm dacă pagina Wikipedia are o imagine thumbnail
    if (!wikiData.thumbnail?.source) {
      return res.status(404).json({
        error: `Nu există imagine disponibilă pentru "${author}" pe Wikipedia.`,
      });
    }

    const imageUrl = wikiData.thumbnail.source;

    // Determinăm extensia fişierului din URL (jpg, png, jpeg etc.)
    const ext = imageUrl.split(".").pop().split("?")[0].toLowerCase();

    // Numele fişierului local: "albert_einstein.jpg"
    // toLowerCase + replace spații nume de fişier valid
    const fileName = `${author.trim().toLowerCase().replace(/\s+/g, "_")}.${ext}`;
    const filePath = path.join(IMAGES_DIR, fileName);

    // Dacă imaginea a fost descărcată anterior, o returnăm direct
    // fără a face o nouă cerere la Wikipedia
    if (fs.existsSync(filePath)) {
      console.log(`Imagine existentă returnată: ${fileName}`);
      return res.status(200).json({ imageUrl: `/images/${fileName}` });
    }

    // Descărcăm imaginea de la Wikipedia
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      return res.status(500).json({ error: "Nu s-a putut descărca imaginea." });
    }

    // Convertim răspunsul într-un Buffer (date binare)
    const buffer = Buffer.from(await imgResponse.arrayBuffer());

    // Scriem fişierul pe disc în directorul /images
    fs.writeFileSync(filePath, buffer);
    console.log(`Imagine salvată: ${fileName}`);

    // Returnăm URL-ul local Express serveşte /images/* ca static
    res.status(200).json({ imageUrl: `/images/${fileName}` });
  } catch (error) {
    console.error("Eroare la fetch-image:", error.message);
    res.status(500).json({ error: "Eroare internă la preluarea imaginii." });
  }
});

// Adaugam imageUrl in schemă
// imageUrl este opțional poate fi string gol sau un path valid
const quoteSchema = Joi.object({
  // ... (păstrați celelalte câmpuri existente)
  imageUrl: Joi.string().allow("").optional(),
});
