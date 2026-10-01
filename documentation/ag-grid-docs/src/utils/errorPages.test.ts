import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { getErrorParamNames } from './getErrorText';

const ERRORS_DIR = join(import.meta.dirname, '../content/errors');
const ERROR_PARAM_PATTERN = /\{%\s*errorParam\s+([^%]*?)\/%\}/g;
const NAME_PATTERN = /name="([^"]+)"/;

const pageFiles = readdirSync(ERRORS_DIR).filter((file) => /^\d+\.mdoc$/.test(file));

describe('errorParam tags name a parameter their error actually takes', () => {
    it.each(pageFiles)('%s', (file) => {
        const code = Number(file.replace('.mdoc', ''));
        const content = readFileSync(join(ERRORS_DIR, file), 'utf8');
        const used = [...content.matchAll(ERROR_PARAM_PATTERN)]
            .map((match) => NAME_PATTERN.exec(match[1])?.[1])
            .filter((name): name is string => name != null);

        // A name the error does not take can never be substituted, so every reader is left reading the
        // bare `<name>` placeholder where the page promised them their own value.
        const available = getErrorParamNames(code as any);
        expect(used.filter((name) => !available.includes(name))).toEqual([]);
    });
});
