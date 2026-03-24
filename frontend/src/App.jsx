import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuotesPage from "./pages/QuotesPage";
import ManagePage from "./pages/ManagePage";
import PasswordGate from "./components/PasswordGate";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuotesPage />} />
        <Route
          path="/manage"
          element={
            <PasswordGate>
              <ManagePage />
            </PasswordGate>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
