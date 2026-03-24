import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuoteCard from "../components/QuoteCard";
import { getAllQuotes } from "../api/quotesApi";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllQuotes(searchTerm)
      .then(setQuotes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-indigo-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">
              Printing Quotes
            </h1>
            <p className="text-sm text-gray-500">
              {loading
                ? "Se caută..."
                : `${quotes.length} ${quotes.length === 1 ? "citat" : "citate"}`}
            </p>
          </div>
          <Link
            to="/manage"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Administrează
          </Link>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Caută după autor sau citat..."
              className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition leading-none"
            />
            {inputValue && (
              <button
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-indigo-500 mt-1 pl-1">
              Rezultate pentru: <strong>"{searchTerm}"</strong>
            </p>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && <p className="text-center text-red-500 py-10">{error}</p>}
        {!error && !loading && quotes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-2">
              {searchTerm
                ? `Niciun citat găsit pentru "${searchTerm}".`
                : "Nu există citate."}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setInputValue("")}
                className="text-indigo-500 underline hover:text-indigo-700 text-sm"
              >
                Șterge filtrele
              </button>
            ) : (
              <Link
                to="/manage"
                className="text-indigo-500 underline hover:text-indigo-700 text-sm"
              >
                Adaugă primul citat →
              </Link>
            )}
          </div>
        )}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse space-y-3"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-1/3 ml-auto mt-4" />
              </div>
            ))}
          </div>
        )}
        {!loading && quotes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((q) => (
              <QuoteCard key={q.id} quote={q} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
