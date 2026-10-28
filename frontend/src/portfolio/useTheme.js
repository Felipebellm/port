import { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";

const STORAGE_KEY = "theme";

/**
 * Initial theme: whatever index.html's pre-paint script already put on <html data-theme>
 * (saved choice, else OS preference). Falls back to dark.
 */
function initialTheme() {
  const t = document.documentElement.dataset.theme;
  return t === "light" ? "light" : "dark";
}

/**
 * useTheme — returns { theme, toggleTheme }.
 * The manual choice persists in localStorage. Switching crossfades the whole page with the
 * View Transitions API where supported (skipped under reduced motion).
 */
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    const apply = () => {
      flushSync(() => setTheme(next));
      document.documentElement.dataset.theme = next;
    };
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduced) document.startViewTransition(apply);
    else apply();
  }, []);

  return { theme, toggleTheme };
}
