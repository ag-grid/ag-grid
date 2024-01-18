import { buildFolderEnd } from "./utils/buildZip";
import { convertStringToByteArray } from "./utils/convert";
import { getHeaderAndContent } from "./utils/getHeaderAndContent";

export interface ZipFile {
    path: string;
    created: Date;
    isBase64: boolean;
    type: 'file' | 'folder';
    content: string | undefined;
    canBeCompressed: boolean;
}

export interface ZipFolder extends ZipFile {
    type: 'folder';
    content: undefined;
    canBeCompressed: false;
}

export class ZipContainer {
    private static folders: ZipFolder[] = [];
    private static files: ZipFile[] = [];

    public static addFolders(paths: string[]): void {
        paths.forEach(this.addFolder.bind(this));
    }

    private static addFolder(path: string): void {
        this.folders.push({
            path,
            created: new Date(),
            isBase64: false,
            type: 'folder',
            content: undefined,
            canBeCompressed: false
        });
    }

    public static addFile(path: string, content: string, canBeCompressed: boolean = false, isBase64 = false): void {
        this.files.push({
            path,
            created: new Date(),
            content,
            isBase64,
            canBeCompressed,
            type: 'file'
        });
    }

    public static async getContent(mimeType: string = 'application/zip', compressOutput: boolean): Promise<Blob> {
        const textOutput = await this.buildFileStream(compressOutput);
        this.clearStream();
        return new Blob([textOutput], { type: mimeType });
    }

    private static clearStream(): void {
        this.folders = [];
        this.files = [];
    }

    private static async buildFileStream(compressOutput: boolean): Promise<Uint8Array> {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const len = totalFiles.length;
        let fileData: Uint8Array = new Uint8Array(0);
        let folderData: Uint8Array = new Uint8Array(0);
        let lL = 0;
        let cL = 0;

        for (const currentFile of totalFiles) {
            const {
                fileHeader,
                folderHeader,
                content,
            } = await getHeaderAndContent(currentFile, lL, compressOutput);

            lL += fileHeader.length + content.length;
            cL += folderHeader.length;

            // Append fileHeader to fData
            const dataWithHeader = new Uint8Array(fileData.length + fileHeader.length);
            dataWithHeader.set(fileData);
            dataWithHeader.set(convertStringToByteArray(fileHeader), fileData.length);
            fileData = dataWithHeader;

            // Append content to fData
            const contentAsUint8Array = typeof content === 'string' ? convertStringToByteArray(content) : content;
            const dataWithContent = new Uint8Array(fileData.length + contentAsUint8Array.length);
            dataWithContent.set(fileData);
            dataWithContent.set(contentAsUint8Array, fileData.length);
            fileData = dataWithContent;

            // Append folder header to foData
            const folderDataWithFolderHeader = new Uint8Array(folderData.length + folderHeader.length);
            folderDataWithFolderHeader.set(folderData);
            folderDataWithFolderHeader.set(convertStringToByteArray(folderHeader), folderData.length);
            folderData = folderDataWithFolderHeader;
        }

        const folderEnd = buildFolderEnd(len, cL, lL);

        // Append folder data and file data
        const folderEndAsUint8Array = convertStringToByteArray(folderEnd);
        const result = new Uint8Array(fileData.length + folderData.length + folderEndAsUint8Array.length);
        result.set(fileData);
        result.set(folderData, fileData.length);
        result.set(folderEndAsUint8Array, fileData.length + folderData.length);

        return result;
    }
}
