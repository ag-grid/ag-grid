/**
 * There are some issues which we have had to resolve by editing plugins as it was the only way to achieve what we
 * needed to. This script applies these customisations by replacing content inside the node_modules after they've been
 * installed; perhaps we should fork the plugins properly and point to those instead.
 */

const fs = require('fs-extra');

fs.copySync('./scripts/customise/index.js', './node_modules/@rollup/plugin-node-resolve/dist/cjs/index.js')

console.log(`--------------------------------------------------------------------------------`);

// const fs = require('fs');
//
// const packageRootDirectories = JSON.parse(fs.readFileSync('lerna.json', 'utf-8')).packages;
// for (const lernaPackage of packageRootDirectories) {
//     const packageRootDirectory = lernaPackage.replace('/*', '');
//     fs.readdirSync(packageRootDirectory)
//         .forEach(packageDirectory => {
//                 const packageJsonFilename = `./${packageRootDirectory}/${packageDirectory}/package.json`;
//                 if (fs.existsSync(packageJsonFilename)) {
//                     const packageJson = JSON.parse(fs.readFileSync(packageJsonFilename, 'utf-8'));
//
//                     if (packageJson.dependencies && packageJson.dependencies['ag-charts-community'] ||
//                         packageJson.devDependencies && packageJson.devDependencies['ag-charts-community'] ||
//                         packageJson.peerDependencies && packageJson.peerDependencies['ag-charts-community']
//                     ) {
//                         const chartsPkgFilename = `./${packageRootDirectory}/${packageDirectory}/node_modules/ag-charts-community/package.json`;
//                         const chartsPkg = require(chartsPkgFilename);
//                         delete chartsPkg['exports'];
//                         fs.writeFileSync(chartsPkgFilename, JSON.stringify(chartsPkg, null, 2), 'utf-8');
//                     }
//                 }
//             }
//         )
// }
