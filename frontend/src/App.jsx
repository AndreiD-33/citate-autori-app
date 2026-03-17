// BrowserRouter - furnizează contextul de rutare întregii aplicații
// Routes        - container pentru toate rutele definite
// Route         - asociază un path cu o componentă
import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuotesPage from "./pages/QuotesPage";
import ManagePage from "./pages/ManagePage";

export default function App() {
  return (
    // BrowserRouter trebuie să învelească întreaga aplicație -
    // Link și useNavigate funcționează doar în interiorul său
    <BrowserRouter>
      <Routes>
        {/* Ruta principală - afișare citate (read-only) */}
        <Route path="/" element={<QuotesPage />} />

        {/* Ruta de administrare - operațiuni CRUD complete */}
        <Route path="/manage" element={<ManagePage />} />
      </Routes>
    </BrowserRouter>
  );
}
