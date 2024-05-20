const fs = require('fs');
const path = require('path');

const LATEST_COMMIT = require('child_process').execSync(`git log --graph latest -n 1`).toString().trim();

const DIST_PATH = 'documentation/ag-grid-docs/dist';

fs.writeFileSync(path.resolve(process.cwd(), DIST_PATH, 'robots.txt'), 'User-agent: * Disallow: /', 'UTF-8');
fs.writeFileSync(path.resolve(process.cwd(), DIST_PATH, 'version.txt'), LATEST_COMMIT, 'UTF-8');
