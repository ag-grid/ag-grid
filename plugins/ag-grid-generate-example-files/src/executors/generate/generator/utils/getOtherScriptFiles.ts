import { SOURCE_ENTRY_FILE_NAME } from '../constants';
import { readAsJsFile } from '../transformation-scripts/parser-utils';
import type { FileContents, InternalFramework, TransformTsFileExt } from '../types';
import { FRAMEWORKS } from '../types';
import { convertTsxToJsx, getFileList } from './fileUtils';

const getOtherTsGeneratedFiles = async ({
    folderPath,
    sourceFileList,
    transformTsFileExt,
    internalFramework,
}: {
    folderPath: string;
    sourceFileList: string[];
    /**
     * File extension for .ts files to be converted to
     */
    transformTsFileExt?: TransformTsFileExt;
    internalFramework: InternalFramework;
}) => {
    const otherTsFiles = sourceFileList
        .filter((fileName) => fileName.endsWith('.ts'))
        // Exclude source entry file, as it is used to generate framework entry file
        .filter((fileName) => fileName !== SOURCE_ENTRY_FILE_NAME)
        .filter((fileName) => {
            // Exclude angular, react functional and vue 3 ts files as they will be handled separately
            const toExclude: InternalFramework[] = ['angular', 'reactFunctionalTs', 'vue3'];
            // We do let _typescript files through for vanilla as they are used for vanilla and need to be readAsJsFile
            // but excluded for vue3 so that they are not accidentally included
            if (internalFramework === 'vue3') {
                toExclude.push('typescript');
            }
            return !toExclude.some((framework) => fileName.includes('_' + framework));
        });

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
        } else if (transformTsFileExt === '.js') {
            let jsFileName = tsFileName.replace('.ts', transformTsFileExt);
            // For provided typescript component files, automatically generate vanilla js files
            jsFileName = jsFileName.replace('_typescript', '_vanilla');
            generatedFiles[jsFileName] = readAsJsFile(srcFile, internalFramework);
        } else {
            const jsFileName = tsFileName.replace('.ts', transformTsFileExt);
            generatedFiles[jsFileName] = readAsJsFile(srcFile, internalFramework);
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
    const otherJsFiles = sourceFileList.filter((fileName) => fileName.endsWith('.js') && !fileName.includes('_vue'));
    return getFileList({
        folderPath,
        fileList: otherJsFiles,
    });
};

/**
 *
 * @param file Get the suffix for the file based on the framework i.e colourCellRenderer_vue.js
 * @param framework
 * @returns
 */
const getComponentSuffix = (file: string, framework: InternalFramework) => {
    if (framework === 'vue3') {
        // Let vue3 share vue files
        if (file.includes('_vue.')) {
            return '_vue';
        }
        if (file.includes('_vue3.')) {
            return '_vue3';
        }
    } else if (framework === 'reactFunctional') {
        // Let reactFunctional share the TS react files
        if (file.includes('_reactFunctionalTs.')) {
            return '_reactFunctionalTs';
        }
    } else if (file.includes('_' + framework + '.')) {
        return '_' + framework;
    }
    return undefined;
};

const isValidFrameworkFile = (internalFramework: InternalFramework, framework: InternalFramework) => {
    if (internalFramework === framework) {
        return true;
    }
    if (internalFramework === 'vue3') {
        // Let vue3 share vue files
        return true;
    }
    if (internalFramework === 'reactFunctional' && framework === 'reactFunctionalTs') {
        // Let reactFunctional share the TS react files
        return true;
    }

    return false;
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
    const frameworkComponents = sourceFileList.filter(
        (fileName) => getComponentSuffix(fileName, internalFramework) !== undefined
    );
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
        internalFramework,
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
    const frameworkComponentSuffix = (framework: InternalFramework) => (framework === 'vue3' ? 'Vue' : '');
    const filteredToFramework = {};
    const others = {};
    Object.entries(contents).forEach(([file, content]) => {
        let isFrameworkFile = false;
        FRAMEWORKS.forEach((framework) => {
            const suffix = getComponentSuffix(file, framework);
            if (suffix !== undefined) {
                if (isValidFrameworkFile(internalFramework, framework)) {
                    if (internalFramework === 'reactFunctional') {
                        filteredToFramework[file.replace('_reactFunctionalTs.tsx', '.jsx')] = convertTsxToJsx(content);
                    } else {
                        filteredToFramework[file.replace(suffix, frameworkComponentSuffix(framework))] = content;
                    }
                } else {
                    // Is a framework file, but not the current framework so we don't want to include it
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

export const getUseFetchJsonFile = (internalFramework: InternalFramework) => {
    if (internalFramework === 'reactFunctional') {
        return `import { useState, useEffect } from 'react';

/**
 * Fetch example Json data
 * Not recommended for production use!
 */
export const useFetchJson = (url, limit) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // Note error handling is omitted here for brevity
            const response = await fetch(url);                
            const json = await response.json();
            const data = limit ? json.slice(0, limit) : json;
            setData(data);
            setLoading(false);
        };
        fetchData();
    }, [url, limit]);
    return { data, loading };
};`;
    } else if (internalFramework === 'reactFunctionalTs') {
        return `import { useState, useEffect } from 'react';

/**
 * Fetch example Json data
 * Not recommended for production use!
 */
export const useFetchJson = <T,>(url:string, limit?: number) => {
    const [data, setData] = useState<T[]>();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Note error handling is omitted here for brevity
            const response = await fetch(url);
            const json = await response.json();
            const data = limit ? json.slice(0, limit) : json;
            setData(data);
            setLoading(false);
        };
        fetchData();
    }, [url, limit]);
    return { data, loading };
};`;
    } else {
        return undefined;
    }
};
