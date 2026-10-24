// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Design-system guardrails enforced by lint, not memory:
 *  - no raw hex colours outside the brand and theme layers
 *  - no textTransform (Turkish casing goes through trUpper)
 *  - no hard-coded brand name outside the brand layer
 *  - no React Native <Text> outside ui/Text
 */
const hex = { selector: 'Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]', message: 'Raw colour: use a semantic token (primitives live in src/brand/palettes.ts).' };
const textTransform = { selector: "Property[key.name='textTransform']", message: 'No textTransform: Turkish casing (i→İ) goes through trUpper / the micro variant.' };
const brandName = { selector: 'Literal[value=/[İI]LANIM VAR|İlanım Var/]', message: 'Brand name lives in src/brand. Use identity or the {{brand}} placeholder.' };

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.expo/*', 'node_modules/*', 'src/brand/generated/*'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', hex, textTransform, brandName],
      'no-restricted-imports': ['error', { paths: [{ name: 'react-native', importNames: ['Text'], message: 'Use Text from @/ui.' }] }],
    },
  },
  { files: ['src/brand/**/*.{ts,tsx}', 'src/theme/**/*.{ts,tsx}'], rules: { 'no-restricted-syntax': ['error', textTransform] } },
  { files: ['src/ui/Text.tsx'], rules: { 'no-restricted-imports': 'off' } },
  { files: ['**/__tests__/**'], rules: { 'no-restricted-syntax': 'off' } },
]);
