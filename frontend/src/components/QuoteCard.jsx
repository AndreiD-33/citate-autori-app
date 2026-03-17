// QuoteCard primește trei props:
//   quote    - obiectul { id, author, quote }
//   onEdit   - funcție callback apelată când utilizatorul apasă "Editează"
//              (undefined în QuotesPage -> butonul nu se afișează)
//   onDelete - funcție callback apelată când utilizatorul apasă "Șterge"
//              (undefined în QuotesPage -> butonul nu se afișează)
export default function QuoteCard({ quote, onEdit, onDelete }) {
  return (
    // Cardul folosește flexbox vertical pentru a împinge butoanele jos
    // shadow-md + hover:shadow-lg = efect de umbrire la hover
    // transition-shadow = animație fluidă pentru shadow
    <div className="flex flex-col justify-between bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      {/* Zona citatului - crește pentru a umple spațiul disponibil */}
      <div className="flex-1">
        {/* Ghilimele decorative mari */}
        <span className="text-5xl text-brand leading-none select-none">"</span>

        {/* Textul citatului - italic, dimensiune medie */}
        <p className="text-gray-700 text-base italic leading-relaxed mt-1">
          {quote.quote}
        </p>
      </div>

      {/* Autorul - aliniat la dreapta, subliniat */}
      <p className="text-right text-sm font-semibold text-brand-dark mt-4">
        — {quote.author}
      </p>

      {/* Butoanele apar DOAR dacă cel puțin un callback este furnizat.
          Operatorul && previne afișarea unui div gol în QuotesPage. */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {onEdit && (
            // onClick transmite întregul obiect `quote` înapoi la ManagePage
            // pentru a popula formularul de editare
            <button
              onClick={() => onEdit(quote)}
              className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors duration-200"
            >
              ✎ Editează
            </button>
          )}

          {onDelete && (
            // onClick transmite doar ID-ul - necesar pentru DELETE
            <button
              onClick={() => onDelete(quote.id)}
              className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
            >
              🗑 Șterge
            </button>
          )}
        </div>
      )}
    </div>
  );
}
