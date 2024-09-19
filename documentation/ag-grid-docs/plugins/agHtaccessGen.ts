import type { AstroIntegration } from 'astro';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getHtaccessContent } from '../src/utils/htaccess/htaccessRules';

type Options = {
    include: boolean;
};

export default function createPlugin(options: Options): AstroIntegration {
    return {
        name: 'ag-htaccess-gen',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                if (!options.include) {
                    // eslint-disable-next-line no-console
                    console.info('[agHtaccessGen] .htaccess generation disabled, skipping');
                    return;
                }

                const destDir = fileURLToPath(dir);
                const filename = join(destDir, '.htaccess');
                writeFileSync(filename, getHtaccessContent());

                // eslint-disable-next-line no-console
                console.info('[agHtaccessGen] .htaccess generated to: ', filename);
            },
        },
    };
}
