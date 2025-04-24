import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**"],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": ["warn", { allow: ["error", "warn", "info", "debug"] }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // Node.js globals
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        console: "readonly",
        // Web APIs
        fetch: "readonly",
        URLSearchParams: "readonly",
        // ES6 globals
        Promise: "readonly",
        Map: "readonly",
        Set: "readonly",
        Symbol: "readonly",
      },
    },
  },
];
