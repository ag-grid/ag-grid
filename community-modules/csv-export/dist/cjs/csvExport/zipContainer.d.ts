import { BeanStub } from "@ag-grid-community/core";
export interface ZipFolder {
    path: string;
    created: Date;
}
export interface ZipFile extends ZipFolder {
    content?: string;
}
export declare class ZipContainer extends BeanStub {
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
