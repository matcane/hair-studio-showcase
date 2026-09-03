const pluginQuery = require("@tanstack/eslint-plugin-query");
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const { allExtensions } = require("eslint-config-expo/flat/utils/extensions");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  {
    ignores: ["src/sqlite/drizzle/**"],
  },
  expoConfig,
  eslintPluginPrettierRecommended,
  pluginQuery.configs["flat/recommended-strict"],
  {
    settings: {
      "import/resolver": {
        typescript: {
          extensions: allExtensions,
        },
      },
    },
  },
  {
    rules: {
      "prettier/prettier": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["@"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
