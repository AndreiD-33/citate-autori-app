import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuoteCard from "../components/QuoteCard";
import {
  getAllQuotes,
  addQuote,
  updateQuote,
  deleteQuote,
} from "../api/quotesApi";

export default function ManagePage() {
  // Lista de citate afișată în secțiunea de jos a paginii
  const [quotes, setQuotes] = useState([]);

  // Dacă editingQuote !== null, formularul este în modul EDITARE.
  // Conține obiectul complet { id, author, quote } al citatului editat.
  const [editingQuote, setEditingQuote] = useState(null);

  // Datele controlate ale formularului - sincronizate cu input-urile
  const [formData, setFormData] = useState({ author: "", quote: "" });

  // Mesaj de feedback după operații (succes sau eroare)
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const [loading, setLoading] = useState(true);

  // La montarea componentei, preluăm citatele existente
  useEffect(() => {
    fetchQuotes();
  }, []);

  // --- Funcții de comunicare cu backend-ul -----------------------

  // Reîncarcă lista de citate - apelată după orice operație CRUD
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

  // --- Handlers formular -----------------------------------------

  // Handler generic pentru toate câmpurile formularului.
  // [e.target.name] folosește proprietatea determinată pentru a actualiza
  // câmpul corespunzător (author sau quote) fără un handler per câmp.
  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Trimiterea formularului - comportament diferit în funcție de mod
  async function handleSubmit(e) {
    // Prevenim comportamentul implicit al formularului (reload pagină)
    e.preventDefault();

    try {
      if (editingQuote) {
        // --- MOD EDITARE: trimitem PUT cu ID-ul citatului editat ---
        await updateQuote(editingQuote.id, formData);
        showFeedback("Citatul a fost actualizat cu succes.", "success");
      } else {
        // --- MOD ADĂUGARE: trimitem POST fără ID ---
        await addQuote(formData);
        showFeedback("Citatul a fost adăugat cu succes.", "success");
      }
      // Indiferent de operație: resetăm formularul și reîncărcăm lista
      resetForm();
      fetchQuotes();
    } catch (err) {
      // Erorile de validare (400) sau rețea (500) ajung aici
      showFeedback(err.message, "error");
    }
  }

  // Populează formularul cu datele citatului selectat pentru editare.
  // Apelat din QuoteCard via prop-ul onEdit.
  function handleEdit(quote) {
    setEditingQuote(quote);
    setFormData({ author: quote.author, quote: quote.quote });
    // Derulăm pagina sus - formularul se află în header
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Șterge citatul cu `id` după confirmare utilizator.
  // Apelat din QuoteCard via prop-ul onDelete.
  async function handleDelete(id) {
    if (!window.confirm("Ești sigur că vrei să ștergi acest citat?")) return;
    try {
      await deleteQuote(id);
      showFeedback("Citatul a fost șters.", "success");
      fetchQuotes();
    } catch (err) {
      showFeedback(err.message, "error");
    }
  }

  // --- Funcții utilitare -----------------------------------------

  // Resetează formularul și iese din modul editare
  function resetForm() {
    setEditingQuote(null);
    setFormData({ author: "", quote: "" });
  }

  // Afișează mesajul de feedback și îl ascunde automat după 3 secunde
  function showFeedback(message, type) {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  }

  // --- Clase CSS reutilizabile (definite o dată, folosite de mai multe ori) ---
  const inputClass = `w-full px-4 py-2 border rounded-lg text-sm
                      focus:outline-none focus:ring-2 focus:ring-brand
                      border-gray-300 bg-white text-gray-800
                      placeholder-gray-400 transition`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div
          className="max-w-5xl mx-auto px-4 py-4 flex items-center
justify-between"
        >
          <h1 className="text-2xl font-bold text-brand">
            ⚙ Administrare citate
          </h1>
          {/* Link de întoarcere a utilizatorului la pagina de afișare */}
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-brand border
border-brand
                       rounded-lg hover:bg-brand hover:text-white
transition-colors duration-200"
          >
            ← Înapoi la citate
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* --- Banner feedback (succes / eroare) --- */}
        {/* Tranziție de opacitate: apare și dispare fluid */}
        {feedback.message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium
transition-opacity duration-300
              ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            {feedback.type === "success" ? "✅" : "⚠️"} {feedback.message}
          </div>
        )}

        {/* --- Formular adăugare / editare --- */}
        <section
          className="bg-white rounded-2xl shadow-sm border border-
gray-100 p-6"
        >
          {/* Titlul și culoarea se schimbă dinamic în funcție de modul
activ */}
          <h2
            className={`text-lg font-semibold mb-6
            ${editingQuote ? "text-amber-600" : "text-brand"}`}
          >
            {editingQuote ? "✎ Editează citatul" : "➕ Adaugă citat nou"}
          </h2>

          {/* onSubmit pe <form> - capturat de handleSubmit */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Câmp autor */}
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium
text-gray-700 mb-1"
              >
                Autor
              </label>
              <input
                id="author"
                name="author" // <- folosit de handleChange cu [e.target.name]
                type="text"
                value={formData.author} // <- input controlat: valoarea
                vine
                din
                state
                onChange={handleChange}
                placeholder="ex. Marcus Aurelius"
                required
                className={inputClass}
              />
            </div>

            {/* Câmp citat */}
            <div>
              <label
                htmlFor="quote"
                className="block text-sm font-medium
text-gray-700 mb-1"
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
                required
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Butoane formular - se schimbă în funcție de mod */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 text-sm font-semibold text-white
rounded-lg
                           transition-colors duration-200
                           ${
                             editingQuote
                               ? "bg-amber-500 hover:bg-amber-600"
                               : "bg-brand hover:bg-brand-dark"
                           }`}
              >
                {editingQuote ? "💾 Salvează modificările" : "➕ Adaugă citat"}
              </button>

              {/* Butonul „Anulează” apare doar în modul editare */}
              {editingQuote && (
                <button
                  type="button" // <- important: nu submitează formularul
                  onClick={resetForm}
                  className="flex-1 py-2.5 text-sm font-semibold text-
gray-600
                             bg-gray-100 rounded-lg hover:bg-gray-200
                             transition-colors duration-200"
                >
                  × Anulează
                </button>
              )}
            </div>
          </form>
        </section>

        {/* --- Lista de citate existente --- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Citate existente
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({quotes.length})
            </span>
          </h2>

          {loading ? (
            <p className="text-center text-brand animate-pulse py-10">
              Se încarcă...
            </p>
          ) : quotes.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Nu există citate. Adaugă primul folosind formularul de mai sus.
            </p>
          ) : (
            // Același grid responsiv ca în QuotesPage
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
gap-6"
            >
              {quotes.map((q) => (
                <QuoteCard
                  key={q.id}
                  quote={q}
                  onEdit={handleEdit} // <- furnizăm callbacks ->
                  butoanele
                  apar
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
