const fs = require('fs');
const queryCompilerLocation = 'node_modules/gatsby/dist/query/query-compiler.js';
const data = fs.readFileSync(queryCompilerLocation).toString().split('\n');

if (data.length === 506) { return; }

data.splice(141, 1, `      nodir: true,\n      ignore: '**/examples/**', // ignore example files`);

fs.writeFileSync(queryCompilerLocation, data.join('\n'));