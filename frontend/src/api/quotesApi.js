// URL-ul de bază al backend-ului Express.
// Toate cererile trec prin Express -> proxy -> json-server.
// React nu comunică niciodată direct cu json-server (:3000).
const BASE_URL = "/api/quotes";

// ----------------------------------------------------------------------
// GET /api/quotes - preia toate citatele
// Folosit în QuotesPage și ManagePage la montarea componentei.
// ----------------------------------------------------------------------
export async function getAllQuotes(search = "") {
  const url = search.trim()
    ? `${BASE_URL}?search=${encodeURIComponent(search.trim())}`
    : BASE_URL;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Nu s-au putut prelua citatele.");
  return response.json();
}

// ----------------------------------------------------------------------
// POST /api/quotes - adaugă un citat nou
// Trimitem { author, quote, imageUrl } - ID-ul este generat de json-server.
// Validarea se face pe backend (Joi) - tratăm erorile de validare.
// ----------------------------------------------------------------------
export async function addQuote(quoteData) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quoteData), // quoteData include acum și imageUrl
  });
  if (!response.ok) {
    const err = await response.json();
    // Erorile de validare Joi vin ca array în `errors`
    throw new Error(err.errors?.join(", ") || "Nu s-a putut adăuga citatul.");
  }
  return response.json();
}

// ----------------------------------------------------------------------
// PUT /api/quotes/:id - actualizează un citat existent
// Versiune actualizată care acceptă și imageUrl în payload
// ----------------------------------------------------------------------
export async function updateQuote(id, quoteData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quoteData), // quoteData include acum și imageUrl
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      err.errors?.join(", ") || "Nu s-a putut actualiza citatul.",
    );
  }
  return response.json();
}

// ----------------------------------------------------------------------
// DELETE /api/quotes/:id - șterge un citat
// Nu returnăm JSON util - verificăm doar că cererea a reușit.
// ----------------------------------------------------------------------
export async function deleteQuote(id) {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Nu s-a putut șterge citatul.");
}

// ----------------------------------------------------------------------
// POST /api/quotes/fetch-image - preia imaginea autorului de pe Wikipedia
// Trimite numele autorului la Express, care îl caută pe Wikipedia.
// Returnează { imageUrl: "/images/nume_autor.jpg" }
// ----------------------------------------------------------------------
export async function fetchAuthorImage(author) {
  // Construim URL-ul corect pentru ruta de fetch-image
  // BASE_URL.replace("/quotes", "") devine "/api" -> "/api/quotes/fetch-image"
  const url = `${BASE_URL.replace("/quotes", "")}/quotes/fetch-image`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Nu s-a putut prelua imaginea.");
  }

  return response.json(); // Returnează obiectul cu path-ul static al imaginii
}
