"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipContainer = void 0;
const zipContainerHelper_1 = require("./zipContainerHelper");
class ZipContainer {
    static addFolders(paths) {
        paths.forEach(this.addFolder.bind(this));
    }
    static addFolder(path) {
        this.folders.push({
            path,
            created: new Date(),
            isBase64: false,
            type: 'folder'
        });
    }
    static addFile(path, content, isBase64 = false) {
        this.files.push({
            path,
            created: new Date(),
            content: isBase64 ? content : new TextEncoder().encode(content),
            isBase64,
            type: 'file'
        });
    }
    static getZipFile(mimeType = 'application/zip') {
        return __awaiter(this, void 0, void 0, function* () {
            const textOutput = yield this.buildCompressedFileStream();
            this.clearStream();
            return new Blob([textOutput], { type: mimeType });
        });
    }
    static getUncompressedZipFile(mimeType = 'application/zip') {
        const textOutput = this.buildFileStream();
        this.clearStream();
        return new Blob([textOutput], { type: mimeType });
    }
    static clearStream() {
        this.folders = [];
        this.files = [];
    }
    static packageFiles(files) {
        let fileData = new Uint8Array(0);
        let folderData = new Uint8Array(0);
        let filesContentAndHeaderLength = 0;
        let folderHeadersLength = 0;
        for (const currentFile of files) {
            const { localFileHeader, centralDirectoryHeader, content, } = currentFile;
            // Append fileHeader to fData
            const dataWithHeader = new Uint8Array(fileData.length + localFileHeader.length);
            dataWithHeader.set(fileData);
            dataWithHeader.set(localFileHeader, fileData.length);
            fileData = dataWithHeader;
            // Append content to fData
            const dataWithContent = new Uint8Array(fileData.length + content.length);
            dataWithContent.set(fileData);
            dataWithContent.set(content, fileData.length);
            fileData = dataWithContent;
            // Append folder header to foData
            const folderDataWithFolderHeader = new Uint8Array(folderData.length + centralDirectoryHeader.length);
            folderDataWithFolderHeader.set(folderData);
            folderDataWithFolderHeader.set(centralDirectoryHeader, folderData.length);
            folderData = folderDataWithFolderHeader;
            filesContentAndHeaderLength += localFileHeader.length + content.length;
            folderHeadersLength += centralDirectoryHeader.length;
        }
        const folderEnd = (0, zipContainerHelper_1.buildCentralDirectoryEnd)(files.length, folderHeadersLength, filesContentAndHeaderLength);
        // Append folder data and file data
        const result = new Uint8Array(fileData.length + folderData.length + folderEnd.length);
        result.set(fileData);
        result.set(folderData, fileData.length);
        result.set(folderEnd, fileData.length + folderData.length);
        return result;
    }
    static buildCompressedFileStream() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalFiles = [...this.folders, ...this.files];
            const readyFiles = [];
            let lL = 0;
            for (const currentFile of totalFiles) {
                const output = yield (0, zipContainerHelper_1.getDeflatedHeaderAndContent)(currentFile, lL);
                const { localFileHeader, content } = output;
                readyFiles.push(output);
                lL += localFileHeader.length + content.length;
            }
            return this.packageFiles(readyFiles);
        });
    }
    static buildFileStream() {
        const totalFiles = [...this.folders, ...this.files];
        const readyFiles = [];
        let lL = 0;
        for (const currentFile of totalFiles) {
            const readyFile = (0, zipContainerHelper_1.getHeaderAndContent)(currentFile, lL);
            const { localFileHeader, content } = readyFile;
            readyFiles.push(readyFile);
            lL += localFileHeader.length + content.length;
        }
        return this.packageFiles(readyFiles);
    }
}
exports.ZipContainer = ZipContainer;
ZipContainer.folders = [];
ZipContainer.files = [];
