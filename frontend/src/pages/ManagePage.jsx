import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuoteCard from "../components/QuoteCard";
import {
  getAllQuotes,
  addQuote,
  updateQuote,
  deleteQuote,
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate(formData)) return;
    try {
      if (editingQuote) {
        await updateQuote(editingQuote.id, formData);
        showFeedback("Citatul a fost actualizat cu succes.", "success");
      } else {
        await addQuote(formData);
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
