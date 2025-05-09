import { getFileList } from './fileUtils';

export const getHtmlFiles = async ({
    folderPath,
    sourceFileList,
}: {
    folderPath: string;
    sourceFileList: string[];
}) => {
    const htmlFiles = sourceFileList.filter((fileName) => fileName.endsWith('.html') && fileName !== 'index.html');

    const htmlContents = await getFileList({
        folderPath,
        fileList: htmlFiles,
    });

    return htmlContents;
};
