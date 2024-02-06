import {
    buildFolderEnd,
    getDeflatedHeaderAndContent,
    getHeaderAndContent,
    ZipFileHeaderAndContent,
} from './zipContainerHelper';

export interface ZipFile {
    path: string;
    created: Date;
    isBase64: boolean;
    type: 'file' | 'folder';
    content?: Uint8Array;
}

export class ZipContainer {
    private static folders: ZipFile[] = [];
    private static files: ZipFile[] = [];

    public static addFolders(paths: string[]): void {
        paths.forEach(this.addFolder.bind(this));
    }

    private static addFolder(path: string): void {
        this.folders.push({
            path,
            created: new Date(),
            isBase64: false,
            type: 'folder'
        });
    }

    public static addFile(path: string, content: string, isBase64 = false): void {
        this.files.push({
            path,
            created: new Date(),
            content: new TextEncoder().encode(content),
            isBase64,
            type: 'file'
        });
    }

    public static async getZipFile(mimeType: string = 'application/zip'): Promise<Blob> {
        const textOutput = await this.buildCompressedFileStream();
        this.clearStream();
        return new Blob([textOutput], { type: mimeType });
    }

    public static getUncompressedZipFile(mimeType: string = 'application/zip'): Blob {
        const textOutput = this.buildFileStream();
        this.clearStream();
        return new Blob([textOutput], { type: mimeType });
    }

    private static clearStream(): void {
        this.folders = [];
        this.files = [];
    }

    private static packageFiles(
        files: ZipFileHeaderAndContent[],
    ) {
        let fileData: Uint8Array = new Uint8Array(0);
        let folderData: Uint8Array = new Uint8Array(0);
        let filesContentAndHeaderLength: number = 0;
        let folderHeadersLength: number = 0;

        for (const currentFile of files) {
            const {
                fileHeader,
                folderHeader,
                content,
            } = currentFile;

            // Append fileHeader to fData
            const dataWithHeader = new Uint8Array(fileData.length + fileHeader.length);
            dataWithHeader.set(fileData);
            dataWithHeader.set(fileHeader, fileData.length);
            fileData = dataWithHeader;

            // Append content to fData
            const dataWithContent = new Uint8Array(fileData.length + content.length);
            dataWithContent.set(fileData);
            dataWithContent.set(content, fileData.length);
            fileData = dataWithContent;

            // Append folder header to foData
            const folderDataWithFolderHeader = new Uint8Array(folderData.length + folderHeader.length);
            folderDataWithFolderHeader.set(folderData);
            folderDataWithFolderHeader.set(folderHeader, folderData.length);
            folderData = folderDataWithFolderHeader;

            filesContentAndHeaderLength += fileHeader.length + content.length;
            folderHeadersLength += folderHeader.length;
        }

        const folderEnd = buildFolderEnd(
            files.length,
            folderHeadersLength,
            filesContentAndHeaderLength,
        );

        // Append folder data and file data
        const result = new Uint8Array(fileData.length + folderData.length + folderEnd.length);

        result.set(fileData);
        result.set(folderData, fileData.length);
        result.set(folderEnd, fileData.length + folderData.length);

        return result;
    }

    private static async buildCompressedFileStream(): Promise<Uint8Array> {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const readyFiles: ZipFileHeaderAndContent[] = [];
        let lL = 0;

        for (const currentFile of totalFiles) {
            if (!currentFile.isBase64) {
                const output = await getDeflatedHeaderAndContent(currentFile, lL);
                const { fileHeader, content } = output;
                readyFiles.push(output);
                lL += fileHeader.length + content.length;
            }
        }

        return this.packageFiles(readyFiles);
    }

    private static buildFileStream(): Uint8Array {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const readyFiles: ZipFileHeaderAndContent[] = [];
        let lL = 0;

        for (const currentFile of totalFiles) {
            const readyFile = getHeaderAndContent(currentFile, lL);
            const { fileHeader, content } = readyFile;
            readyFiles.push(readyFile);
            lL += fileHeader.length + content.length;
        }

        return this.packageFiles(readyFiles);
    }
}
