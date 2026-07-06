/** Convierte texto con tildes a ASCII seguro para impresoras termicas. */
export function sanitizeForPrinter(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\x00-\x7F]/g, (char) => {
      const replacements: Record<string, string> = {
        "Ñ": "N",
        "ñ": "n",
        "¿": "?",
        "¡": "!",
        "°": "o",
        "–": "-",
        "—": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
      };

      return replacements[char] ?? "";
    });
}
