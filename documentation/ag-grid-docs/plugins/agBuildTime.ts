import type { AstroIntegration } from 'astro';
import { execSync } from 'child_process';
import path from 'node:path';

const BUILD_TIME_SCRIPT = '../../scripts/buildTime.mjs';

export default function createPlugin(): AstroIntegration {
    return {
        name: 'ag-build-time',
        hooks: {
            'astro:config:setup': async ({ logger, command }) => {
                if (command !== 'dev') {
                    return;
                }

                const currentDirectory = process.cwd();
                const scriptPath = path.join(currentDirectory, BUILD_TIME_SCRIPT);

                const stopOutput = execSync(`node ${scriptPath} stop`, {
                    encoding: 'utf-8',
                });
                logger.info(stopOutput);

                const elapsedOutput = execSync(`node ${scriptPath} elapsed`, {
                    encoding: 'utf-8',
                });
                logger.info(elapsedOutput);
            },
        },
    };
}
