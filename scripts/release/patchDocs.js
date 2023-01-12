const fs = require('fs');
const path = require('path');

// const LATEST_HASH = require('child_process').execSync('grep origin/latest .git/packed-refs | cut -d " " -f1').toString().trim();
// const LATEST_COMMIT = require('child_process').execSync(`git log ${LATEST_HASH} -n 1`).toString().trim();
const LATEST_COMMIT = require('child_process').execSync(`git log  HEAD^..HEAD -n 1`).toString().trim();

const DIST_PATH = 'grid-packages/ag-grid-docs/dist';

fs.writeFileSync(path.resolve(process.cwd(), DIST_PATH, "robots.txt"), "User-agent: * Disallow: /", 'UTF-8')
fs.writeFileSync(path.resolve(process.cwd(), DIST_PATH, "version.txt"), LATEST_COMMIT, 'UTF-8')



