// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface ZipFolder {
    path: string;
    created: Date;
}
export interface ZipFile extends ZipFolder {
    content?: string;
}
export declare class ZipContainer {
    private folders;
    private files;
    private addFolder;
    addFolders(paths: string[]): void;
    addFile(path: string, content: string): void;
    private clearStream;
    getContent(mimeType?: string): Blob;
    private buildFileStream;
    private getHeader;
    private buildFolderEnd;
    private buildUint8Array;
    private getFromCrc32Table;
    private convertTime;
    private convertDate;
}
