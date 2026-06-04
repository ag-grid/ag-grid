import type { AstroIntegration } from 'astro';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { HtaccessEnv } from '../src/utils/htaccess/htaccessRules';
import { getHtaccessContent } from '../src/utils/htaccess/htaccessRules';

type Options = {
    /** The HTACCESS env value: 'staging' | 'production' (legacy 'true' = production) | 'false'/unset = off. */
    htaccessEnv: string | undefined;
};

function resolveEnv(htaccessEnv: string | undefined): HtaccessEnv | undefined {
    if (htaccessEnv === 'staging') {
        return 'staging';
    }
    // 'true' retained for backwards compatibility with older deploy configs.
    if (htaccessEnv === 'production' || htaccessEnv === 'true') {
        return 'production';
    }
    return undefined;
}

export default function createPlugin(options: Options): AstroIntegration {
    const env = resolveEnv(options.htaccessEnv);
    return {
        name: 'ag-htaccess-gen',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                if (!env) {
                    // eslint-disable-next-line no-console
                    console.info('[agHtaccessGen] .htaccess generation disabled, skipping');
                    return;
                }

                const destDir = fileURLToPath(dir);
                const filename = join(destDir, '.htaccess');
                writeFileSync(filename, getHtaccessContent({ env }));

                // eslint-disable-next-line no-console
                console.info(`[agHtaccessGen] ${env} .htaccess generated to: `, filename);
            },
        },
    };
}
