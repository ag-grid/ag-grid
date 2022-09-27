import withSolid from 'rollup-preset-solid';

export default withSolid({
  input: 'src/index.tsx',
  targets: ['esm', 'cjs'],
  printInstructions: false // no solidjs/jsx export if this is enabled
})
