import React from "react";
import { createRoot } from "react-dom/client";
import GeoOpsCadastros from "./App.jsx";

/* Persistência da beta: window.storage sobre localStorage.
   Mantém a interface { get(key) -> {value} | null, set(key, value) } que o App usa.
   Na migração para produção, isto vira services/storage.js (Supabase) — ver Mapa de Migração. */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const value = localStorage.getItem(key);
        return value == null ? null : { value };
      } catch {
        return null;
      }
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
    },
  };
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GeoOpsCadastros />
  </React.StrictMode>
);
