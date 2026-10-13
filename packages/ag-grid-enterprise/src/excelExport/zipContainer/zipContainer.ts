import type { ProcessedZipFile } from './zipContainerHelper';
import { buildCentralDirectoryEnd, getHeaderAndContent, getHeaders, preprocessFileForZip } from './zipContainerHelper';

const MAX_CONCURRENT_COMPRESSIONS = 4;

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
        try {
            return await this.buildCompressedFileStream(mimeType);
        } finally {
            this.clearStream();
        }
    }

    public getUncompressedZipFile(mimeType: string = 'application/zip'): Blob {
        try {
            return this.buildFileStream(mimeType);
        } finally {
            this.clearStream();
        }
    }

    private clearStream(): void {
        this.folders = [];
        this.files = [];
    }

    private packageFiles(files: ProcessedZipFile[], mimeType: string): Blob {
        let fileLen: number = 0;
        let folderLen: number = 0;
        const fileData: BlobPart[] = [];
        const folderData: BlobPart[] = [];

        for (const currentFile of files) {
            const { localFileHeader, centralDirectoryHeader, content } = currentFile;
            fileLen += localFileHeader.length + content.length;
            folderLen += centralDirectoryHeader.length;
            fileData.push(localFileHeader, content);
            folderData.push(centralDirectoryHeader);
        }

        const folderEnd = buildCentralDirectoryEnd(files.length, folderLen, fileLen);
        return new Blob([...fileData, ...folderData, folderEnd], { type: mimeType });
    }

    private async buildCompressedFileStream(mimeType: string): Promise<Blob> {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const processed: ProcessedZipFile[] = [];

        let offset = 0;
        for (let start = 0, len = totalFiles.length; start < len; start += MAX_CONCURRENT_COMPRESSIONS) {
            const batch = totalFiles.slice(start, start + MAX_CONCURRENT_COMPRESSIONS);
            const preprocessed = await Promise.all(batch.map(preprocessFileForZip));
            for (let i = 0, batchSize = batch.length; i < batchSize; ++i) {
                const currentFile = batch[i];
                const { rawContent, rawSize, deflatedContent, deflatedSize, isCompressed } = preprocessed[i];
                const headers = getHeaders(currentFile, isCompressed, offset, rawSize, rawContent, deflatedSize);
                const contentToUse = deflatedContent ?? rawContent;
                processed.push({ ...headers, content: contentToUse, isCompressed });
                offset += headers.localFileHeader.length + contentToUse.length;
                currentFile.content = undefined;
            }
        }

        return this.packageFiles(processed, mimeType);
    }

    private buildFileStream(mimeType: string): Blob {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const readyFiles: ProcessedZipFile[] = [];
        let lL = 0;

        for (const currentFile of totalFiles) {
            const readyFile = getHeaderAndContent(currentFile, lL);
            const { localFileHeader, content } = readyFile;
            readyFiles.push(readyFile);
            lL += localFileHeader.length + content.length;
        }

        return this.packageFiles(readyFiles, mimeType);
    }
}
