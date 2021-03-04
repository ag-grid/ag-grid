export interface ZipFolder {
    path: string;
    created: Date;
}
export interface ZipFile extends ZipFolder {
    content?: string;
}
export declare class ZipContainer {
    private static folders;
    private static files;
    static addFolders(paths: string[]): void;
    static addFile(path: string, content: string): void;
    static getContent(mimeType?: string): Blob;
    private static addFolder;
    private static clearStream;
    private static buildFileStream;
    private static getHeader;
    private static buildFolderEnd;
    private static buildUint8Array;
    private static getFromCrc32Table;
    private static convertTime;
    private static convertDate;
}
