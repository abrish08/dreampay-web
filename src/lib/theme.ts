export type Theme = "light" | "dark" | "system";
export const THEME_COOKIE = "pg_theme";
export const isTheme = (v: unknown): v is Theme => v === "light" || v === "dark" || v === "system";
