import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';

import { redirectsChecker } from '../src/utils/htaccess/redirectsChecker';

type Options = {
    skip: boolean;
};

export default function createPlugin(options: Options): AstroIntegration {
    return {
        name: 'ag-redirects-checker',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                if (options.skip) {
                    logger.info('Redirects checker skipped');
                    return;
                }

                const destDir = fileURLToPath(dir);

                redirectsChecker({ buildDir: destDir, logger });
            },
        },
    };
}
