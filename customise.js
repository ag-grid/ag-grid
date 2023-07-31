/**
 * There are some issues which we have had to resolve by editing plugins as it was the only way to achieve what we
 * needed to. This script applies these customisations by replacing content inside the node_modules after they've been
 * installed; perhaps we should fork the plugins properly and point to those instead.
 */

const fs = require('fs-extra');

fs.copySync('./scripts/customise/index.js', './node_modules/@rollup/plugin-node-resolve/dist/cjs/index.js')

console.log(`--------------------------------------------------------------------------------`);
