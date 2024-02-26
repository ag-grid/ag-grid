import fs from 'fs/promises';
import path from 'path';

import { readFile, readJSONFile } from '../../../executors-utils';
import { ANGULAR_GENERATED_MAIN_FILE_NAME, SOURCE_ENTRY_FILE_NAME } from './constants';
import gridVanillaSrcParser from './transformation-scripts/grid-vanilla-src-parser';
import { FRAMEWORKS, GeneratedContents, InternalFramework } from './types';
import {
    getBoilerPlateFiles,
    getEntryFileName,
    getIsEnterprise,
    getMainFileName,
    getProvidedExampleFiles,
    getProvidedExampleFolder,
    getTransformTsFileExt
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

    const [scriptFiles, frameworkScriptFiles] = await getOtherScriptFiles({
        folderPath,
        sourceFileList,
        transformTsFileExt: getTransformTsFileExt(internalFramework),
        internalFramework,
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
        .concat(Object.keys(frameworkScriptFiles))
        .concat(Object.keys(styleFiles));

    return generatedFileList;
};

type GeneratedContentParams = {
    internalFramework: InternalFramework;
    folderPath: string;
    isDev?: boolean;
    importType?: 'modules' | 'packages';
    gridOptionsTypes?: any;
};

/**
 * Get generated contents for an example
 */
export const getGeneratedContents = async (params: GeneratedContentParams): Promise<GeneratedContents | undefined> => {
    const { internalFramework, folderPath, isDev = false, importType, gridOptionsTypes } = params;
    const sourceFileList = await fs.readdir(folderPath);

    if(sourceFileList.includes('SKIP_EXAMPLE_GENERATION.md')) {
        const msg = `Skipping example generation for ${folderPath} as there is a SKIP_EXAMPLE_GENERATION.md file present.`;
        console.log(msg);
        return {
            skipped: msg,
            generatedFiles: {},
        } as any;
    }

    if (!sourceFileList.includes(SOURCE_ENTRY_FILE_NAME)) {
        throw new Error('Unable to find example entry-point at: ' + folderPath);
    }

    if(!gridOptionsTypes){
        console.error('No gridOptionsTypes provided!');
        //gridOptionsTypes = await readJSONFile('plugins/ag-grid-generate-example-files/src/gridOptionsTypes/_gridOptions_Types.json');
    }

    const entryFilePath = path.join(folderPath, SOURCE_ENTRY_FILE_NAME);
    const entryFile = await readFile(entryFilePath);
    const indexHtml = await readFile(path.join(folderPath, 'index.html'));

    const [otherScriptFiles, componentScriptFiles] = await getOtherScriptFiles({
        folderPath,
        sourceFileList,
        transformTsFileExt: getTransformTsFileExt(internalFramework),
        internalFramework,
    });
    const providedExampleFileNames = getProvidedExampleFiles({ folderPath, internalFramework });

    const entryType = providedExampleFileNames.length > 0 ? 'mixed' : 'generated';

    const providedExampleBasePath = getProvidedExampleFolder({
        folderPath,
        internalFramework,
    });
    const providedExampleEntries = await Promise.all(
        providedExampleFileNames.map(async (fileName) => {
            let contents = (await fs.readFile(path.join(providedExampleBasePath, fileName))).toString('utf-8');
            return [fileName, contents];
        })
    );
    const frameworkProvidedExamples = Object.fromEntries(providedExampleEntries);

    const frameworkHasProvided = {};
    FRAMEWORKS.forEach((framework) => {
        frameworkHasProvided[framework] = getProvidedExampleFiles({ folderPath, internalFramework: framework }).length > 0;
    });

    const styleFiles = await getStyleFiles({ folderPath, sourceFileList });

    const isEnterprise = getIsEnterprise({ entryFile });

    const { bindings, typedBindings } = gridVanillaSrcParser(
        folderPath,
        entryFile,
        indexHtml,
        {}, // Hardcoded for now used to provide custom theme, width, height for inline styles
        entryType,
        frameworkHasProvided,
        gridOptionsTypes
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
    const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);
    const entryFileName = getEntryFileName(internalFramework)!;
    const mainFileName = getMainFileName(internalFramework)!;

    let scriptFiles: string[] = [];
    let files: Record<string, string> = {}
    if (providedExampleEntries.length === 0) {
        const { files: f, scriptFiles: s } = await getFrameworkFiles({
            entryFile,
            indexHtml,
            isEnterprise,
            bindings,
            typedBindings,
            componentScriptFiles,
            otherScriptFiles,
            ignoreDarkMode: false,
            isDev,
            importType,
        });
        files = f;
        scriptFiles = s;
    } 

    const result: GeneratedContents = {
        isEnterprise,
        scriptFiles: scriptFiles!,
        styleFiles: Object.keys(styleFiles),
        sourceFileList,
        // Replace files with provided examples
        files: Object.assign(styleFiles, files, frameworkProvidedExamples),
        // Files without provided examples
        generatedFiles: files,
        boilerPlateFiles,
        providedExamples: frameworkProvidedExamples,
        entryFileName,
        mainFileName,
        packageJson,
    };

    return result;
};
