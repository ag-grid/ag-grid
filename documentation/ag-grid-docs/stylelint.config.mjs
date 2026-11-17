import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createWebsiteStylelintConfig } from '../../external/ag-website-shared/stylelint/config.mjs';

export default createWebsiteStylelintConfig({ websiteRoot: dirname(fileURLToPath(import.meta.url)) });
