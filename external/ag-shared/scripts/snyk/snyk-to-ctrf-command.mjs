import fs from 'fs';
import path from 'path';

import { convertToCtrf } from './snyk-to-ctrf.mjs';

const SNYK_JSON_FILE = process.env.SNYK_JSON_FILE;
const CTRF_OUTPUT_FILE = process.env.CTRF_OUTPUT_FILE || 'snyk.ctrf.json';

if (!SNYK_JSON_FILE) {
    console.error('Error: SNYK_JSON_FILE environment variable is not set.');
    process.exit(1);
}
const cwd = process.cwd();
const snykPath = path.resolve(cwd, SNYK_JSON_FILE);
const ctrfPath = path.resolve(cwd, CTRF_OUTPUT_FILE);

if (!fs.existsSync(snykPath)) {
    console.error(`Error: Snyk JSON file not found at path: ${snykPath}`);
    process.exit(1);
}

(async () => {
    console.log(`Snyk JSON file: ${snykPath}`);
    const snykJson = fs.readFileSync(snykPath, 'utf-8');
    let snykData;
    try {
        snykData = JSON.parse(snykJson);
    } catch (e) {
        // Newer Snyk CLI versions append error objects after the main JSON array
        // when workspace paths fail (e.g. root with "Forbidden"). Extract first document.
        const position = e.message.match(/at position (\d+)/)?.[1];
        if (!position) {
            throw e;
        }

        console.log(`::warning:: Failed to parse Snyk JSON (${SNYK_JSON_FILE}). Attempting to extract valid JSON portion up to position ${position} (${e.message})`);
        snykData = JSON.parse(snykJson.slice(0, parseInt(position, 10)));
    }
    const ctrf = convertToCtrf(snykData);

    fs.mkdirSync(path.dirname(ctrfPath), { recursive: true });
    fs.writeFileSync(ctrfPath, JSON.stringify(ctrf, null, 2));
    console.log(`Converted Snyk data to CTRF format and saved to ${ctrfPath}`);
})();
