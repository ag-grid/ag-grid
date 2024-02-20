export interface ZipFile {
    path: string;
    created: Date;
    isBase64: boolean;
    type: 'file' | 'folder';
    content?: string | Uint8Array;
}
export declare class ZipContainer {
    private static folders;
    private static files;
    static addFolders(paths: string[]): void;
    private static addFolder;
    static addFile(path: string, content: string, isBase64?: boolean): void;
    static getZipFile(mimeType?: string): Promise<Blob>;
    static getUncompressedZipFile(mimeType?: string): Blob;
    private static clearStream;
    private static packageFiles;
    private static buildCompressedFileStream;
    private static buildFileStream;
}
