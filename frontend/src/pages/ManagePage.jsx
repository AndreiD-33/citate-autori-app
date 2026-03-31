import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuoteCard from "../components/QuoteCard";
import {
  getAllQuotes,
  addQuote,
  updateQuote,
  deleteQuote,
  fetchAuthorImage,
} from "../api/quotesApi";
import { useFormValidation } from "../hooks/useFormValidation";

const VALIDATION_RULES = {
  author: {
    required: true,
    requiredMsg: "Autorul este obligatoriu.",
    minLength: 2,
    minLengthMsg: "Autorul trebuie să aibă cel puțin 2 caractere.",
    maxLength: 100,
    maxLengthMsg: "Autorul poate avea maxim 100 de caractere.",
  },
  quote: {
    required: true,
    requiredMsg: "Citatul este obligatoriu.",
    minLength: 5,
    minLengthMsg: "Citatul trebuie să aibă cel puțin 5 caractere.",
    maxLength: 500,
    maxLengthMsg: "Citatul poate avea maxim 500 de caractere.",
  },
};

export default function ManagePage() {
  const [quotes, setQuotes] = useState([]);
  const [editingQuote, setEditingQuote] = useState(null);
  const [formData, setFormData] = useState({ author: "", quote: "" });
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true);

  // Stări noi pentru gestionarea imaginii
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const { errors, validate, clearErrors } = useFormValidation(VALIDATION_RULES);

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    try {
      const data = await getAllQuotes();
      setQuotes(data);
    } catch (err) {
      showFeedback(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Funcția nouă pentru preluarea imaginii
  async function handleFetchImage() {
    if (!formData.author.trim()) {
      setImageError("Introduceți mai întâi numele autorului.");
      return;
    }

    setImageLoading(true);
    setImageError("");

    try {
      const result = await fetchAuthorImage(formData.author);
      setImageUrl(result.imageUrl);
    } catch (err) {
      setImageError(err.message);
      setImageUrl("");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate(formData)) return;

    // Includem imageUrl în payload-ul trimis către backend
    const payload = { ...formData, imageUrl };

    try {
      if (editingQuote) {
        await updateQuote(editingQuote.id, payload);
        showFeedback("Citatul a fost actualizat cu succes.", "success");
      } else {
        await addQuote(payload);
        showFeedback("Citatul a fost adăugat cu succes.", "success");
      }
      resetForm();
      fetchQuotes();
    } catch (err) {
      showFeedback(err.message, "error");
    }
  }

  function handleEdit(quote) {
    setEditingQuote(quote);
    setFormData({ author: quote.author, quote: quote.quote });
    setImageUrl(quote.imageUrl || ""); // Populăm imaginea dacă există
    setImageError("");
    clearErrors();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (window.confirm("Ești sigur că vrei să ștergi acest citat?")) return;
    try {
      await deleteQuote(id);
      showFeedback("Citatul a fost șters.", "success");
      fetchQuotes();
    } catch (err) {
      showFeedback(err.message, "error");
    }
  }

  function resetForm() {
    setEditingQuote(null);
    setFormData({ author: "", quote: "" });
    setImageUrl(""); // Resetăm imaginea
    setImageError("");
    clearErrors();
  }

  function showFeedback(message, type) {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  }

  const inputBase = `w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition`;
  const inputClass = (field) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-gray-300 focus:ring-indigo-300 bg-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">
            Administrare citate
          </h1>
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors duration-200"
          >
            Înapoi la citate
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {feedback.message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium ${feedback.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {feedback.message}
          </div>
        )}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2
            className={`text-lg font-semibold mb-6 ${editingQuote ? "text-amber-600" : "text-indigo-600"}`}
          >
            {editingQuote ? "Editează citatul" : "Adaugă citat nou"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Autor
              </label>
              <input
                id="author"
                name="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                placeholder="ex. Marcus Aurelius"
                className={inputClass("author")}
              />
              {errors.author && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {errors.author}
                </p>
              )}
            </div>

            {/* Secțiunea imagine autor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagine autor
              </label>
              <div className="flex gap-2">
                {/* Butonul caută imaginea pe Wikipedia prin Express */}
                <button
                  type="button"
                  onClick={handleFetchImage}
                  disabled={imageLoading || !formData.author.trim()}
                  className="flex-1 py-2 px-4 text-sm font-medium rounded-lg border border-indigo-300 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {imageLoading
                    ? "Se caută..."
                    : "🔍 Caută imagine pe Wikipedia"}
                </button>

                {/* Dacă există imagine, afişăm buton de ştergere */}
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setImageError("");
                    }}
                    className="px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    X
                  </button>
                )}
              </div>

              {/* Mesaj de eroare dacă Wikipedia nu găsește autorul */}
              {imageError && (
                <p className="mt-1 text-xs text-red-500">{imageError}</p>
              )}

              {/* Previzualizare imagine apare după ce s-a găsit cu succes */}
              {imageUrl && !imageError && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <img
                    src={`http://localhost:5000${imageUrl}`}
                    alt={formData.author}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                    // Fallback dacă imaginea nu se încarcă
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      {formData.author}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">
                      {imageUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="quote"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Citat
              </label>
              <textarea
                id="quote"
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                placeholder="Introduceți citatul..."
                rows={4}
                className={`${inputClass("quote")} resize-none`}
              />
              <div className="flex justify-between mt-1">
                {errors.quote ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.quote}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs ml-auto ${formData.quote.length > 450 ? "text-red-400" : "text-gray-400"}`}
                >
                  {formData.quote.length}/500
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors duration-200 ${editingQuote ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {editingQuote ? "Salvează modificările" : "Adaugă"}
              </button>
              {editingQuote && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
              )}
            </div>
          </form>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Citate existente{" "}
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({quotes.length})
            </span>
          </h2>
          {loading ? (
            <p className="text-center text-indigo-500 animate-pulse py-10">
              Se încarcă...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((q) => (
                <QuoteCard
                  key={q.id}
                  quote={q}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
