const fs = require('fs');

// Gatsby looks for queries in all JavaScript and TypeScript files inside src by default. This means that it will
// needlessly inspect all of our example files for queries, which noticeably affects performance. This optimisation
// will exclude our example folders from Gatsby's query compilation to avoid this.

const queryCompilerLocation = 'node_modules/gatsby/dist/query/query-compiler.js';
const data = fs.readFileSync(queryCompilerLocation).toString().split('\n');

if (data.length === 506) { return; }

data.splice(141, 1, `      nodir: true,\n      ignore: '**/examples/**', // ignore example files`);

fs.writeFileSync(queryCompilerLocation, data.join('\n'));