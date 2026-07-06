import { useState, useEffect, useCallback } from "react";
import en from "./content/en.json";
import ptBR from "./content/pt-BR.json";

const DICTIONARIES = { en, "pt-BR": ptBR };
const STORAGE_KEY = "locale";

/**
 * Decide which locale to show a fresh visitor.
 * Any browser language that starts with "pt" (pt-BR, pt-PT, pt, ...) means the
 * visitor is in a Portuguese-speaking locale -> serve Brazilian Portuguese.
 * Everyone else gets English.
 */
function detectLocale() {
  const langs =
    (typeof navigator !== "undefined" &&
      (navigator.languages || [navigator.language])) ||
    [];
  const speaksPortuguese = langs.some(
    (l) => typeof l === "string" && l.toLowerCase().startsWith("pt")
  );
  return speaksPortuguese ? "pt-BR" : "en";
}

/**
 * useLocale — returns { locale, content, setLocale }.
 * A manual choice saved in localStorage always wins over browser detection,
 * so the selected language persists across visits.
 */
export default function useLocale() {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && DICTIONARIES[saved]) return saved;
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
