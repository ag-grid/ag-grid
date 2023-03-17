export interface ZipFolder {
    path: string;
    created: Date;
    isBase64: boolean;
}
export interface ZipFile extends ZipFolder {
    content?: string;
}
export declare class ZipContainer {
    private static folders;
    private static files;
    static addFolders(paths: string[]): void;
    private static addFolder;
    static addFile(path: string, content: string, isBase64?: boolean): void;
    static getContent(mimeType?: string): Blob;
    private static clearStream;
    private static buildFileStream;
    private static getHeader;
    private static getConvertedContent;
    private static buildFolderEnd;
    private static buildUint8Array;
    private static getFromCrc32Table;
    private static convertTime;
    private static convertDate;
}
