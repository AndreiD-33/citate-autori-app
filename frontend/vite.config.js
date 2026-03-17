import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <- plugin oficial Tailwind v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <- detectează automat fișierele proiectului, fără config suplimentar
  ],
  server: {
    // Proxy: cererile /api sunt redirecționate către Express
    // -> elimină erorile CORS în dezvoltare
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
