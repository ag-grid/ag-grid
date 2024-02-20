import path from 'path';

export interface CreateFilePathFinderParams {
    baseUrl: string;
    globConfig: GlobConfig;
}

export interface GlobConfig {
    sourceFolder: string;
    fileNameGlob: string;
}

export interface FilePathFinder {
    globPattern: string;
    getFilePath: (globFile: string) => string;
}

export function createFilePathFinder({ baseUrl, globConfig }: CreateFilePathFinderParams): FilePathFinder {
    const { sourceFolder, fileNameGlob } = globConfig;
    const globPattern = path.join(baseUrl, sourceFolder, fileNameGlob);
    const fullFolderPath = path.join(baseUrl, sourceFolder);
    const sourceNumFolders = fullFolderPath.split(path.sep).length;

    const getFilePath = (globFile: string) => {
        const fileFolders = globFile.split(path.sep);
        const filePath = fileFolders.slice(sourceNumFolders, fileFolders.length).join(path.sep);

        return filePath;
    };

    return {
        globPattern,
        getFilePath,
    };
}
