import { SOURCE_ENTRY_FILE_NAME } from '../constants';
import { readAsJsFile } from '../transformation-scripts/parser-utils';
import { FileContents, FRAMEWORKS, InternalFramework, TransformTsFileExt } from '../types';
import { getFileList } from './fileUtils';

const getOtherTsGeneratedFiles = async ({
    folderPath,
    sourceFileList,
    transformTsFileExt,
}: {
    folderPath: string;
    sourceFileList: string[];
    /**
     * File extension for .ts files to be converted to
     */
    transformTsFileExt?: TransformTsFileExt;
}) => {
    const otherTsFiles = sourceFileList
        .filter((fileName) => fileName.endsWith('.ts'))
        // Exclude source entry file, as it is used to generate framework entry file
        .filter((fileName) => fileName !== SOURCE_ENTRY_FILE_NAME);

    const tsFileContents = await getFileList({
        folderPath,
        fileList: otherTsFiles,
    });

    const generatedFiles = {} as FileContents;
    Object.keys(tsFileContents).forEach((tsFileName) => {
        const srcFile = tsFileContents[tsFileName];
        if (transformTsFileExt === '.tsx') {
            const tsxFileName = tsFileName.replace('.ts', '.tsx');
            generatedFiles[tsxFileName] = srcFile;
        } else if (transformTsFileExt === undefined) {
            generatedFiles[tsFileName] = srcFile;
        } else {
            const jsFileName = tsFileName.replace('.ts', transformTsFileExt);
            generatedFiles[jsFileName] = readAsJsFile(srcFile);
        }
    });

    return generatedFiles;
};

const getOtherJsFiles = ({
    folderPath,
    sourceFileList,
}: {
    folderPath: string;
    sourceFileList: string[];
}): Promise<FileContents> => {
    const otherJsFiles = sourceFileList.filter((fileName) => fileName.endsWith('.js'));
    return getFileList({
        folderPath,
        fileList: otherJsFiles,
    });
};

const getComponentFiles = ({
    folderPath,
    sourceFileList,
    internalFramework,
}: {
    folderPath: string;
    sourceFileList: string[];
    internalFramework: InternalFramework;
}): Promise<FileContents> => {
    const frameworkComponents = sourceFileList.filter((fileName) => fileName.includes('_' + internalFramework));
    return getFileList({
        folderPath,
        fileList: frameworkComponents,
    });
};

export const getOtherScriptFiles = async ({
    folderPath,
    sourceFileList,
    transformTsFileExt,
    internalFramework,
}: {
    folderPath: string;
    sourceFileList: string[];
    transformTsFileExt?: TransformTsFileExt;
    internalFramework: InternalFramework;
}) => {
    const otherTsGeneratedFileContents = await getOtherTsGeneratedFiles({
        folderPath,
        sourceFileList,
        transformTsFileExt,
    });
    const otherJsFileContents = await getOtherJsFiles({
        folderPath,
        sourceFileList,
    });
    const componentFiles = await getComponentFiles({
        folderPath,
        sourceFileList,
        internalFramework,
    });

    const contents = { ...otherTsGeneratedFileContents, ...otherJsFileContents, ...componentFiles } as FileContents;
    const frameworkComponentSuffix = (framework: InternalFramework) =>
        framework === 'vue' || framework === 'vue3' ? 'Vue' : '';
    const filteredToFramework = {};
    const others = {};
    Object.entries(contents).forEach(([file, content]) => {
        let isFrameworkFile = false;
        FRAMEWORKS.forEach((framework) => {
            const suffix = '_' + framework;
            if (file.includes(suffix)) {
                if (internalFramework === framework) {
                    filteredToFramework[file.replace(suffix, frameworkComponentSuffix(framework))] = content;
                }
                isFrameworkFile = true;
            }
        });
        if (!isFrameworkFile) {
            others[file] = content;
        }
    });
    return [others, filteredToFramework];
};
