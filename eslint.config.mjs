import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-console": "warn", // Warns when using console.log
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          "ignoreRestArgs": false,
          "fixToUnknown": false,
        },
      ],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrors": "none" }], // ✅ Allows unused catch error
      "react-hooks/rules-of-hooks": "error", // Ensures rules of hooks are followed
      "react/jsx-no-undef": "error", // Errors when using undefined JSX components
      "react/jsx-uses-react": "error", // Errors when React is not in scope
      "react/prop-types": "off", // Disables prop-types validation (useful if you're using TypeScript)
      "react/display-name": "off", // Disables display name validation
      "react/jsx-key": "error", // Errors when a key prop is missing in a list
      "react/jsx-no-target-blank": "error", // Errors when target="_blank" is used without rel="noreferrer"
      "react/jsx-no-comment-textnodes": "error", // Errors when comments are used as text nodes
      "react/jsx-no-duplicate-props": "error", // Errors when duplicate props are used
      "react/jsx-no-useless-fragment": "error", // Errors when unnecessary fragments are used
      "react/jsx-pascal-case": "error", // Errors when component names are not in PascalCase
      "react/jsx-fragments": ["error", "syntax"], // Enforces shorthand or standard fragment syntax
      "react/jsx-curly-brace-presence": ["error", { "props": "never", "children": "never" }], // Enforces no unnecessary curly braces
      "react/jsx-boolean-value": ["error", "never"], // Enforces no unnecessary boolean values
      "react/jsx-closing-bracket-location": ["error", "line-aligned"], // Enforces closing bracket location
      "react/jsx-closing-tag-location": "error", // Enforces closing tag location
      "react/jsx-sort-props": "off", // Disables sorting of props
      "react/no-deprecated": "error", // Errors when using deprecated React methods
      "react/no-direct-mutation-state": "error", // Errors when directly mutating state
      "react/no-set-state": "off", // Disables no setState
      "react/no-string-refs": "error", // Errors when using string refs
      "react/no-this-in-sfc": "error", // Errors when using this in a stateless functional component
      "react/no-typos": "error", // Errors when using typos in React lifecycle methods
      "react/no-unescaped-entities": "error", // Errors when using unescaped entities in JSX
      "react/no-unknown-property": "error", // Errors when using unknown properties in JSX
      "react/no-unsafe": "error", // Errors when using unsafe lifecycle methods
      "react/no-unused-prop-types": "error", // Errors when using unused prop types
      "react/no-unused-state": "error", // Errors when using unused state
      "react/require-default-props": "off", // Disables requiring default props
      "react/require-render-return": "error", // Errors when not returning a value from render
      "react/void-dom-elements-no-children": "error", // Errors when using children in void DOM elements
      "react-hooks/exhaustive-deps": "off", // or "off" if you want to disable it

    },
  },
];

export default eslintConfig;
