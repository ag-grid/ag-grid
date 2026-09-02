import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';

import { demoTitleChecker } from '../src/utils/seo/demoTitleChecker';

export default function createPlugin(): AstroIntegration {
    return {
        name: 'ag-demo-title-checker',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                demoTitleChecker({ buildDir: fileURLToPath(dir), logger });
            },
        },
    };
}
