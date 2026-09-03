import { SITE_BASE_URL } from '@constants';
import { getIsDev } from '@utils/env';
import { getExampleRootFileUrl } from '@utils/pages';
import { pathJoin } from '@utils/pathJoin';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { ExampleSubstitutions, GeneratedContents, InternalFramework } from './types';

export type GeneratedExampleParams = ExampleParams & DocsExampleParams;

type ExampleParams = {
    exampleName: string;
    ignoreDarkMode?: boolean;
};

type DocsExampleParams = {
    type: 'docs';
    framework: InternalFramework;
    pageName: string;
};

const getFolderPath = (params: GeneratedExampleParams) => {
    const { exampleName } = params;

    const contentRoot = getExampleRootFileUrl();

    const result = [contentRoot.pathname];
    if (params.type === 'docs') {
        result.push(params.type, params.pageName, '_examples', exampleName, params.framework);
    }

    return path.join(...result);
};

const getContentJsonPath = (params: GeneratedExampleParams) => {
    const folderPath = getFolderPath(params);

    return path.join(folderPath, 'contents.json');
};

// Resolves to the absolute URL of the docs site serving the example, so examples can reference
// site assets (e.g. fonts) by an absolute URL that also works once opened in Plunker/CodeSandbox.
const DEFAULT_SUBSTITUTIONS: ExampleSubstitutions = {
    '${baseWWWUrl}': pathJoin(import.meta.env?.PUBLIC_SITE_URL, SITE_BASE_URL),
};

const applySubstitutions = (content: GeneratedContents, substitutions: ExampleSubstitutions): GeneratedContents => {
    Object.keys(substitutions).forEach((key) => {
        const value = substitutions[key as keyof ExampleSubstitutions];

        Object.keys(content.files).forEach((file) => {
            let count = 0;
            while (content.files[file].includes(key)) {
                count++;
                content.files[file] = content.files[file].replace(key, value);

                if (count > 1000) {
                    throw new Error('Substitution limit of 1000 reached, is this a bug?');
                }
            }
        });
    });

    return content;
};

const cacheKeys: Record<string, object> = {};
const cacheValues = new WeakMap<object, GeneratedContents>();

const readContentJson = async (params: GeneratedExampleParams) => {
    const useCache = !getIsDev();
    const jsonPath = getContentJsonPath(params);

    let result;

    const cacheKey = cacheKeys[jsonPath] ?? { jsonPath };
    if (useCache) {
        if (cacheValues.has(cacheKey)) {
            result = cacheValues.get(cacheKey);
        }
    }

    if (!result) {
        const buffer = await fs.readFile(jsonPath);
        result = JSON.parse(buffer.toString('utf-8')) as GeneratedContents;
    }

    if (params.framework === 'angular') {
        result.files['main.ts'] = result.boilerPlateFiles!['main.ts'];
    }

    if (useCache) {
        cacheKeys[jsonPath] = cacheKey;
        cacheValues.set(cacheKey, result);
    }

    return applySubstitutions(result, DEFAULT_SUBSTITUTIONS);
};

export const hasGeneratedContents = async (params: GeneratedExampleParams) => {
    return existsSync(getContentJsonPath(params));
};

export const getGeneratedContentsFileList = async (params: GeneratedExampleParams) => {
    const contents = await readContentJson(params);

    return Object.keys(contents.files);
};

export const getGeneratedContents = async (params: GeneratedExampleParams) => {
    return readContentJson(params);
};
