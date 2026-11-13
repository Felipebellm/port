import { useState, useEffect, useCallback } from "react";
import en from "./content/en.json";
import ptBR from "./content/pt-BR.json";

const DICTIONARIES = { en, "pt-BR": ptBR };
const STORAGE_KEY = "locale";

/**
 * Decide which locale to show a fresh visitor from the browser's primary
 * language: Portuguese of any region (pt-BR, pt-PT, pt, ...) gets Brazilian
 * Portuguese, every other language gets English.
 */
function detectLocale() {
  if (typeof navigator === "undefined") return "en";
  const primary = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  return primary.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

/**
 * useLocale — returns { locale, content, setLocale }.
 * A manual choice saved in localStorage always wins over browser detection,
 * so the selected language persists across visits.
 */
export default function useLocale() {
  const [locale, setLocaleState] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && DICTIONARIES[saved]) return saved;
    } catch (e) {
      /* storage blocked: fall back to detection */
    }
    return detectLocale();
  });

  const setLocale = useCallback((next) => {
    if (!DICTIONARIES[next]) return;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore storage errors (private mode, etc.) */
    }
  }, []);

  const content = DICTIONARIES[locale] || en;

  // Keep <html lang>, document.title and the meta description in sync.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    if (content.meta) {
      if (content.meta.title) document.title = content.meta.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && content.meta.description) {
        meta.setAttribute("content", content.meta.description);
      }
    }
  }, [locale, content]);

  return { locale, content, setLocale };
}
