// Configuración ESLint que funciona con React Native/Expo
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.{js,jsx}"],
    ignores: [
      "tailwind.config.js",
      "babel.config.js", 
      "metro.config.js",
      "expo.config.js",
      "*.config.js"
    ],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
      },
      globals: {
        // React Native/Expo globals
        console: "readonly",
        __DEV__: "readonly",
        window: "readonly",
        document: "readonly",
        global: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        // React globals
        React: "readonly",
        JSX: "readonly",
      }
    },
    rules: {
      // Solo reglas de imports para detectar rutas rotas
      "import/no-unresolved": "error",
      "import/no-absolute-path": "error", 
      "import/no-duplicates": "warn",
      
      // Desactivar reglas problemáticas con JSX
      "no-undef": "off",
      "no-unused-vars": "warn",
      "no-unexpected-multiline": "off",
    },
  },
  // Configuración separada para archivos de configuración
  {
    files: ["*.config.js", "tailwind.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", // CommonJS
      globals: {
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      }
    },
    rules: {
      "no-undef": "error",
    },
  },
];