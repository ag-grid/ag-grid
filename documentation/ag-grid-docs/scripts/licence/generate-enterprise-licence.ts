/* eslint-disable no-console -- standalone CLI: reports the file it writes */
/**
 * Generates `packages/ag-grid-enterprise/LICENSE.html`, the licence shipped in the
 * `ag-grid-enterprise` package, from the Commercial End User Licence Agreement published at
 * /eula/commercial/, so the package and the website cannot drift.
 *
 * The file is a standalone HTML document: the agreement's heading, version and introductory notice
 * (`EULA_CONTENT`), then the clauses and schedules rendered from `src/content/policies/eula.mdoc`.
 * Run by `scripts/deployments/prep_and_archive/updateLicenses.sh` at deployment, and by hand with
 * `npx tsx scripts/licence/generate-enterprise-licence.ts` from `documentation/ag-grid-docs`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderEulaHtml } from '../../src/utils/eula/renderEulaHtml';

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const eulaSourcePath = resolve(docsDir, 'src/content/policies/eula.mdoc');
const licencePath = resolve(docsDir, '../../packages/ag-grid-enterprise/LICENSE.html');

writeFileSync(licencePath, renderEulaHtml(readFileSync(eulaSourcePath, 'utf8')));
console.log(`Wrote ${licencePath}`);
