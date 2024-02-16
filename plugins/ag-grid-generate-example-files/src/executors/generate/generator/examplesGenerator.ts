import fs from 'fs/promises';
import path from 'path';

import { readFile } from '../../../executors-utils';
import { ANGULAR_GENERATED_MAIN_FILE_NAME, SOURCE_ENTRY_FILE_NAME } from './constants';
import gridVanillaSrcParser from './transformation-scripts/grid-vanilla-src-parser';
import type { GeneratedContents, InternalFramework } from './types';
import {
    getEntryFileName,
    getIsEnterprise,
    getProvidedExampleFiles,
    getProvidedExampleFolder,
    getTransformTsFileExt,
} from './utils/fileUtils';
import { frameworkFilesGenerator } from './utils/frameworkFilesGenerator';
import { getOtherScriptFiles } from './utils/getOtherScriptFiles';
import { getPackageJson } from './utils/getPackageJson';
import { getStyleFiles } from './utils/getStyleFiles';

type FileListParams = {
    internalFramework: InternalFramework;
    folderPath: string;
};

/**
 * Get the file list of the generated contents
 * (without generating the contents)
 */
export const getGeneratedContentsFileList = async (params: FileListParams): Promise<string[]> => {
    const { internalFramework, folderPath } = params;

    const entryFileName = getEntryFileName(internalFramework)!;
    const sourceFileList = await fs.readdir(folderPath);

    const scriptFiles = await getOtherScriptFiles({
        folderPath,
        sourceFileList,
        transformTsFileExt: getTransformTsFileExt(internalFramework),
    });
    const styleFiles = await getStyleFiles({
        folderPath,
        sourceFileList,
    });
    // Angular is a special case where the `main.ts` entry file is a boilerplate file
    // and another file is generated from the source file `main.ts`.
    // Both the boilerplate entry file and the generated file need to
    // be added to the generated file list
    const angularFiles = internalFramework === 'angular' ? [ANGULAR_GENERATED_MAIN_FILE_NAME] : [];

    const generatedFileList = ['index.html', entryFileName]
        .concat(angularFiles)
        .concat(Object.keys(scriptFiles))
        .concat(Object.keys(styleFiles));

    return generatedFileList;
};

type GeneratedContentParams = {
    internalFramework: InternalFramework;
    folderPath: string;
    isDev?: boolean;
    importType?: 'modules'| 'packages';
};

/**
 * Get generated contents for an example
 */
export const getGeneratedContents = async (params: GeneratedContentParams): Promise<GeneratedContents | undefined> => {
    const { internalFramework, folderPath, isDev = false, importType } = params;
    const sourceFileList = await fs.readdir(folderPath);

    if (!sourceFileList.includes(SOURCE_ENTRY_FILE_NAME)) {
        throw new Error('Unable to find example entry-point at: ' + folderPath);
    }

    const entryFilePath = path.join(folderPath, SOURCE_ENTRY_FILE_NAME);
    const entryFile = await readFile(entryFilePath);
    const indexHtml = await readFile(path.join(folderPath, 'index.html'));

    const otherScriptFiles = await getOtherScriptFiles({
        folderPath,
        sourceFileList,
        transformTsFileExt: getTransformTsFileExt(internalFramework),
    });
    const providedExampleFileNames = getProvidedExampleFiles({ folderPath, internalFramework });

    const providedExampleBasePath = getProvidedExampleFolder({
        folderPath,
        internalFramework,
    });
    const mainEntryFilename = getEntryFileName(internalFramework);
    const providedExampleEntries = await Promise.all(
        providedExampleFileNames.map(async (fileName) => {
            let contents = (await fs.readFile(path.join(providedExampleBasePath, fileName))).toString('utf-8');

            // if (fileName === mainEntryFilename && !ignoreDarkMode) {
            //     contents = contents + '\n' + getDarkModeSnippet();
            // }

            return [fileName, contents];
        })
    );
    const providedExamples = Object.fromEntries(providedExampleEntries);

    const styleFiles = await getStyleFiles({ folderPath, sourceFileList });

    const isEnterprise = getIsEnterprise({ entryFile });

    const { bindings, typedBindings } = gridVanillaSrcParser(
        folderPath,
        entryFilePath,
        entryFile,
        indexHtml,
        {}, // Hardcoded for now used to provide custom theme, width, height for inline styles
        'generated', // Hardcoded for now,
        providedExamples
    );

    const getFrameworkFiles = frameworkFilesGenerator[internalFramework];
    if (!getFrameworkFiles) {
        throw new Error(`No entry file config generator for '${internalFramework}'`);
    }
    const packageJson = getPackageJson({
        isEnterprise,
        internalFramework,
        importType,
    });

    const { files, boilerPlateFiles, scriptFiles, entryFileName, mainFileName } = await getFrameworkFiles({
        entryFile,
        indexHtml,
        isEnterprise,
        bindings,
        typedBindings,
        otherScriptFiles,
        ignoreDarkMode: false,
        isDev,
        importType,
    });

    const result: GeneratedContents = {
        isEnterprise,
        scriptFiles: scriptFiles!,
        styleFiles: Object.keys(styleFiles),
        sourceFileList,
        // Replace files with provided examples
        files: Object.assign(styleFiles, files, providedExamples),
        // Files without provided examples
        generatedFiles: files,
        boilerPlateFiles: boilerPlateFiles!,
        providedExamples,
        entryFileName,
        mainFileName,
        packageJson,
    };

    return result;
};
