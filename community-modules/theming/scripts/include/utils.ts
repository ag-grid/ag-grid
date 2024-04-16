import fs from 'fs';
import { globSync } from 'glob';
import { join } from 'path';
import * as prettier from 'prettier';

export const fatalError = (message: string) => {
    // eslint-disable-next-line no-console
    console.error(`🔥 FATAL ERROR: ${message}`);
    process.exit(1);
};

export const writeTsFile = async (path: string, content: string) => {
    const fs = await import('fs');
    const prettierConfig = (await prettier.resolveConfig(getProjectDir())) || undefined;
    try {
        content = await prettier.format(content, { parser: 'typescript', ...prettierConfig });
    } catch (e) {
        console.error(e);
        content += `\n\nSYNTAX ERROR WHILE FORMATTING:\n\n${(e as any).stack || e}`;
    }
    fs.writeFileSync(path, content);
};

export const getProjectDir = () => join(__dirname, '..', '..', 'src');

export const removeAllGeneratedFiles = () => {
    globSync(join(getProjectDir(), `**/GENERATED-*`)).forEach((file) => {
        fs.rmSync(file);
    });
};

export const DEV_MODE = process.argv.includes('--dev');

export const camelCase = (str: string) => str.replace(/[\W_]+([a-z])/g, (_, letter) => letter.toUpperCase());
