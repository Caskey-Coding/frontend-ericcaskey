// eslint 10 dropped eslintrc support entirely; Next 16 removed `next lint`.
// eslint-config-next 16 ships native flat-config arrays — spread both the
// core-web-vitals and typescript presets (mirrors the old .eslintrc.json
// `extends: ["next/core-web-vitals", "next/typescript"]`).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Net-new react-hooks rules from eslint-config-next 16 flagging
    // pre-existing run-on-mount patterns (Nav theme bootstrap). Disabled as
    // tracked follow-up — matches the caskeycoding.com frontend decision.
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
];

export default eslintConfig;
