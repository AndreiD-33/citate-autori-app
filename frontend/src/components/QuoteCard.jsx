export default function QuoteCard({ quote, onEdit, onDelete }) {
  // URL-ul imaginii prefixăm cu adresa serverului Express
  // Dacă nu există imagine, afişăm un placeholder cu inițialele autorului
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
              // Dacă imaginea nu se încarcă, afişăm placeholder-ul
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
        <p className="text-sm font-semibold text-indigo-700 leading-tight">
          {quote.author}
        </p>
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
