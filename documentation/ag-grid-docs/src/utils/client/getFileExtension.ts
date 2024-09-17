export function getFileExtension(file: string) {
    const filePathSplit = file.split('/');
    const fileName = filePathSplit[filePathSplit.length - 1];
    const fileNameSplit = fileName.split('.');
    const fileExtension = fileNameSplit.length <= 1 ? undefined : fileNameSplit[fileNameSplit.length - 1];

    return fileExtension;
}
