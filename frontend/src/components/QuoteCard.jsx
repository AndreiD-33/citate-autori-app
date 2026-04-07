import { useState } from "react";
import { fetchAuthorInfo } from "../api/quotesApi";

export default function QuoteCard({ quote, onEdit, onDelete }) {
  // Stări pentru tooltip AI
  const [tooltipInfo, setTooltipInfo] = useState("");
  const [tooltipLoading, setTooltipLoading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipError, setTooltipError] = useState("");

  // Handler hover pe numele autorului cu cache simplu
  async function handleAuthorHover() {
    setTooltipVisible(true);
    // Dacă avem deja informația sau o eroare, nu mai facem o nouă cerere la AI
    if (tooltipInfo || tooltipError) return;

    setTooltipLoading(true);
    try {
      const data = await fetchAuthorInfo(quote.author);
      setTooltipInfo(data.info);
    } catch (err) {
      setTooltipError("Informații indisponibile momentan.");
    } finally {
      setTooltipLoading(false);
    }
  }

  // URL-ul imaginii prefixăm cu adresa serverului Express
  // Dacă nu există imagine, afișăm un placeholder cu inițialele autorului
  const imgSrc = quote.imageUrl
    ? `http://localhost:5000${quote.imageUrl}`
    : null;

  // Extragem inițialele pentru placeholder (ex. "Albert Einstein" -> "AE")
  const initials = quote.author
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col justify-between bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      {/* Header card: imagine autor */}
      <div className="flex items-center gap-3 mb-4">
        {imgSrc ? (
          // Fotografie reală de pe Wikipedia (servită local prin Express)
          <img
            src={imgSrc}
            alt={quote.author}
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0"
            onError={(e) => {
              // Dacă imaginea nu se încarcă, afișăm placeholder-ul
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Placeholder cu inițiale vizibil dacă nu există imagine */}
        <div
          className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0"
          style={{ display: imgSrc ? "none" : "flex" }}
        >
          {initials}
        </div>

        {/* Numele autorului cu tooltip AI */}
        <div
          className="relative"
          onMouseEnter={handleAuthorHover}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          {/* Indiciu vizual că există info extra (cursor-help + border-dashed) */}
          <p className="text-sm font-semibold text-indigo-700 leading-tight cursor-help hover:text-indigo-900 transition-colors border-b border-dashed border-indigo-300 inline-block">
            {quote.author}
          </p>

          {/* Tooltip apare la hover */}
          {tooltipVisible && (
            <div className="absolute bottom-full left-0 mb-2 w-64 z-50 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-2xl pointer-events-none">
              {/* Triunghi decorativ */}
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />

              {tooltipLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span className="text-gray-300">
                    Se încarcă informații...
                  </span>
                </div>
              ) : tooltipError ? (
                <p className="text-red-300">{tooltipError}</p>
              ) : (
                <div>
                  <span className="inline-block bg-indigo-500 text-white px-1.5 py-0.5 rounded mb-1.5 font-medium">
                    AI
                  </span>
                  <p className="text-gray-100 leading-relaxed">{tooltipInfo}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Textul citatului */}
      <div className="flex-1">
        <span className="text-4xl text-indigo-300 leading-none select-none">
          "
        </span>
        <p className="text-gray-600 text-sm italic leading-relaxed mt-1">
          {quote.quote}
        </p>
      </div>

      {/* Butoane acţiuni (doar în ManagePage) */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={() => onEdit(quote)}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors duration-200"
            >
              Editează
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(quote.id)}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
            >
              Şterge
            </button>
          )}
        </div>
      )}
    </div>
  );
}
