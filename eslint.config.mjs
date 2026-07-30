// eslint 10 dropped eslintrc support entirely; Next 16 removed `next lint`.
// eslint-config-next 16 ships native flat-config arrays — spread both the
// core-web-vitals and typescript presets (mirrors the old .eslintrc.json
// `extends: ["next/core-web-vitals", "next/typescript"]`).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  // ds-bundle/.ds-sync are local design-sync scratch: untracked, so CI's clean
  // checkout never has them, but while they sit in a working tree `npm run lint`
  // lints the bundled React inside them and reports 17 phantom errors. That makes
  // the LOCAL gate fail where the real one passes, which is the wrong way round
  // for a fleet that gates on local CI. Flat config does not read .gitignore, so
  // the ignore has to live here.
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'next-env.d.ts',
      'ds-bundle/**',
      '.ds-sync/**',
    ],
  },
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
