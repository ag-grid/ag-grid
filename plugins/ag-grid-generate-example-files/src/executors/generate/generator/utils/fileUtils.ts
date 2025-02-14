import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import prettier from 'prettier';
import { JsxEmit, ModuleKind, ScriptTarget, transpileModule } from 'typescript';

import type { InternalFramework, TransformTsFileExt } from '../types';
import { TYPESCRIPT_INTERNAL_FRAMEWORKS } from '../types';

const BOILER_PLATE_FILE_PATH = './documentation/ag-grid-docs/public/example-runner';

export const getBoilerPlateName = (internalFramework: InternalFramework) => {
    const boilerPlateTemplate = (boilerPlateKey: string) => `grid-${boilerPlateKey}-boilerplate`;

    switch (internalFramework) {
        case 'reactFunctional':
            return boilerPlateTemplate('react');
        case 'reactFunctionalTs':
            return boilerPlateTemplate('react-ts');
        case 'typescript':
        case 'angular':
        case 'vue3':
            return boilerPlateTemplate(internalFramework);
        default:
            return undefined;
    }
};

export const getTransformTsFileExt = (internalFramework: InternalFramework): TransformTsFileExt => {
    let transformTsFileExt: TransformTsFileExt;
    if (internalFramework === 'reactFunctionalTs') {
        transformTsFileExt = '.tsx';
    } else if (internalFramework === 'reactFunctional') {
        transformTsFileExt = '.jsx';
    } else if (!TYPESCRIPT_INTERNAL_FRAMEWORKS.includes(internalFramework)) {
        transformTsFileExt = '.js';
    }

    return transformTsFileExt;
};

export const getBoilerPlateFiles = async (isDev: boolean, internalFramework: InternalFramework) => {
    const boilerplateName = getBoilerPlateName(internalFramework);

    if (!boilerplateName) {
        return {};
    }
    const boilerPlatePath = path.join(BOILER_PLATE_FILE_PATH, boilerplateName);

    const fileNames = readdirSync(boilerPlatePath);

    const files: Record<string, string> = {};
    const fileContentPromises = fileNames.map(async (fileName) => {
        if (!isDev && fileName === 'systemjs.config.dev.js') {
            // Ignore systemjs dev file if on production
            return;
        }
        const filePath = path.join(boilerPlatePath, fileName);
        try {
            const contents = readFileSync(filePath, 'utf-8');
            if (contents) {
                files[fileName] = contents;
            }
        } catch (e) {
            // Skip missing files.
        }
    });
    await Promise.all(fileContentPromises);

    return files;
};

export const getFrameworkFromInternalFramework = (internalFramework: InternalFramework) => {
    switch (internalFramework) {
        case 'typescript':
        case 'vanilla':
            return 'javascript';
        case 'reactFunctionalTs':
        case 'reactFunctional':
            return 'react';
        case 'vue3':
            return 'vue';
        default:
            return internalFramework;
    }
};

/**
 * Entry filename to execute code
 */
export const getEntryFileName = (internalFramework: InternalFramework) => {
    switch (internalFramework) {
        case 'typescript':
        case 'angular':
            return 'main.ts';
        case 'reactFunctional':
            return 'index.jsx';
        case 'reactFunctionalTs':
            return 'index.tsx';
        case 'vanilla':
            return 'main.js';
        case 'vue3':
            return 'main.ts';
        default:
            return;
    }
};

/**
 * Main filename showing code that is run
 */
export const getMainFileName = (internalFramework: InternalFramework) => {
    switch (internalFramework) {
        case 'angular':
            return 'app.component.ts';
        default:
            return getEntryFileName(internalFramework);
    }
};

export const getProvidedExampleFolder = ({
    folderPath,
    internalFramework,
}: {
    folderPath: string;
    internalFramework: InternalFramework;
}) => {
    return path.join(folderPath, 'provided', internalFramework);
};

export const getProvidedExampleFiles = ({
    folderPath,
    internalFramework,
}: {
    folderPath: string;
    internalFramework: InternalFramework;
}) => {
    const providedFolder = getProvidedExampleFolder({ folderPath, internalFramework });

    return existsSync(providedFolder) ? readdirSync(providedFolder) : [];
};

export const getFileList = async ({ folderPath, fileList }: { folderPath: string; fileList: string[] }) => {
    const contentFiles = {} as Record<string, string>;
    await Promise.all(
        fileList.map(async (fileName) => {
            try {
                const file = readFileSync(path.join(folderPath, fileName));
                contentFiles[fileName] = file.toString('utf-8');
            } catch (e) {
                // Skip missing files.
            }
        })
    );

    return contentFiles;
};

export const getIsEnterprise = ({ entryFile }: { entryFile: string }) => entryFile?.includes('ag-grid-enterprise');
export const getIsLocale = ({ entryFile }: { entryFile: string }) => entryFile?.includes('@ag-grid-community/locale');

export function convertTsxToJsx(fileStr: string): string {
    // replace empty lines with a comment so that it does not get removed by the transpiler
    fileStr = fileStr.replace(/^\s*$/gm, '// empty line');

    let jsxFile = transpileModule(fileStr, {
        compilerOptions: {
            target: ScriptTarget.ESNext,
            module: ModuleKind.ESNext,
            jsx: JsxEmit.Preserve,
            removeComments: false,
        },
    }).outputText;

    // remove the comments to return the file to its original state
    jsxFile = jsxFile.replaceAll('// empty line', '');
    return jsxFile;
}

export async function formatFile(internalFramework: InternalFramework, fileString: string): Promise<string> {
    try {
        const parser =
            TYPESCRIPT_INTERNAL_FRAMEWORKS.includes(internalFramework) || internalFramework === 'vanilla'
                ? 'typescript'
                : 'babel';
        return await prettier.format(fileString, {
            parser,
        });
    } catch (e) {
        console.error(`Error formatting file for ${internalFramework}`, e);
    }
}
