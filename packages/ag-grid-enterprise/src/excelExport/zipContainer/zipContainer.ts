import type { ProcessedZipFile } from './zipContainerHelper';
import { buildCentralDirectoryEnd, getDeflatedHeaderAndContent, getHeaderAndContent } from './zipContainerHelper';

export interface ZipFile {
    path: string;
    created: Date;
    isBase64: boolean;
    type: 'file' | 'folder';
    content?: string | Uint8Array;
}

export class ZipContainer {
    private folders: ZipFile[] = [];
    private files: ZipFile[] = [];

    public addFolders(paths: string[]): void {
        paths.forEach(this.addFolder.bind(this));
    }

    private addFolder(path: string): void {
        this.folders.push({
            path,
            created: new Date(),
            isBase64: false,
            type: 'folder',
        });
    }

    public addFile(path: string, content: string, isBase64 = false): void {
        this.files.push({
            path,
            created: new Date(),
            content: isBase64 ? content : new TextEncoder().encode(content),
            isBase64,
            type: 'file',
        });
    }

    public async getZipFile(mimeType: string = 'application/zip'): Promise<Blob> {
        const textOutput = await this.buildCompressedFileStream();
        this.clearStream();
        return new Blob([textOutput], { type: mimeType });
    }

    public getUncompressedZipFile(mimeType: string = 'application/zip'): Blob {
        const textOutput = this.buildFileStream();
        this.clearStream();
        return new Blob([textOutput], { type: mimeType });
    }

    private clearStream(): void {
        this.folders = [];
        this.files = [];
    }

    private packageFiles(files: ProcessedZipFile[]) {
        let fileLen: number = 0;
        let folderLen: number = 0;

        for (const currentFile of files) {
            const { localFileHeader, centralDirectoryHeader, content } = currentFile;
            fileLen += localFileHeader.length + content.length;
            folderLen += centralDirectoryHeader.length;
        }

        const fileData: Uint8Array = new Uint8Array(fileLen);
        const folderData: Uint8Array = new Uint8Array(folderLen);

        let fileOffset = 0;
        let folderOffset = 0;
        for (const currentFile of files) {
            const { localFileHeader, centralDirectoryHeader, content } = currentFile;

            // Append fileHeader to fData
            fileData.set(localFileHeader, fileOffset);
            fileOffset += localFileHeader.length;

            // Append content to fData
            fileData.set(content, fileOffset);
            fileOffset += content.length;

            // Append folder header to foData
            folderData.set(centralDirectoryHeader, folderOffset);
            folderOffset += centralDirectoryHeader.length;
        }

        const folderEnd = buildCentralDirectoryEnd(files.length, folderLen, fileLen);

        // Append folder data and file data
        const result = new Uint8Array(fileData.length + folderData.length + folderEnd.length);

        result.set(fileData);
        result.set(folderData, fileData.length);
        result.set(folderEnd, fileData.length + folderData.length);

        return result;
    }

    private async buildCompressedFileStream(): Promise<Uint8Array> {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const readyFiles: ProcessedZipFile[] = [];
        let lL = 0;

        for (const currentFile of totalFiles) {
            const output = await getDeflatedHeaderAndContent(currentFile, lL);
            const { localFileHeader, content } = output;
            readyFiles.push(output);
            lL += localFileHeader.length + content.length;
        }

        return this.packageFiles(readyFiles);
    }

    private buildFileStream(): Uint8Array {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const readyFiles: ProcessedZipFile[] = [];
        let lL = 0;

        for (const currentFile of totalFiles) {
            const readyFile = getHeaderAndContent(currentFile, lL);
            const { localFileHeader, content } = readyFile;
            readyFiles.push(readyFile);
            lL += localFileHeader.length + content.length;
        }

        return this.packageFiles(readyFiles);
    }
}
