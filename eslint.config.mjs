import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["src/**/*.{ts}", "tests/**/*.{ts}"],
  },
  {
    // ignore setup as eslint complains that it is located outside of the project root
    ignores: ["./dist/**", "**/*.js", "./tests/setup.ts"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
