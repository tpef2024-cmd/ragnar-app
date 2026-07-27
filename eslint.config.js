import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      // Esta regla marca como "error" cualquier useEffect que dispare una carga
      // de datos (ej: cargarAtletas(), cargarRMs()) — un patrón normal y usado
      // en toda la app para traer datos de Supabase al entrar a una pantalla.
      // La bajamos a "warn" para no bloquear el editor con falsos positivos.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
