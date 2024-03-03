import { getFileList } from './fileUtils';

export const getStyleFiles = async ({
    folderPath,
    sourceFileList,
}: {
    folderPath: string;
    sourceFileList: string[];
}) => {
    const styleFiles = sourceFileList.filter((fileName) => fileName.endsWith('.css'));

    const styleContents = await getFileList({
        folderPath,
        fileList: styleFiles,
    });

    return styleContents;
};
