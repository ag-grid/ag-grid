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
exports.getDecodedContent = exports.convertStringToByteArray = exports.buildCentralDirectoryEnd = exports.getHeaderAndContent = exports.getDeflatedHeaderAndContent = void 0;
const core_1 = require("@ag-grid-community/core");
const convert_1 = require("./convert");
const crcTable_1 = require("./crcTable");
const compress_1 = require("./compress");
const { utf8_encode } = core_1._;
const getDeflatedHeaderAndContent = (currentFile, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const { content } = currentFile;
    const { size, content: rawContent } = !content
        ? ({ size: 0, content: Uint8Array.from([]) })
        : (0, exports.getDecodedContent)(content);
    let deflatedContent = undefined;
    let deflatedSize = undefined;
    let deflationPerformed = false;
    const shouldDeflate = currentFile.type === 'file' && rawContent && size > 0;
    if (shouldDeflate) {
        const result = yield (0, compress_1.deflateLocalFile)(rawContent);
        deflatedContent = result.content;
        deflatedSize = result.size;
        deflationPerformed = true;
    }
    const headers = getHeaders(currentFile, deflationPerformed, offset, size, rawContent, deflatedSize);
    return Object.assign(Object.assign({}, headers), { content: deflatedContent || rawContent, isCompressed: deflationPerformed });
});
exports.getDeflatedHeaderAndContent = getDeflatedHeaderAndContent;
const getHeaderAndContent = (currentFile, offset) => {
    const { content } = currentFile;
    const { content: rawContent } = !content
        ? ({ content: Uint8Array.from([]) })
        : (0, exports.getDecodedContent)(content);
    const headers = getHeaders(currentFile, false, offset, rawContent.length, rawContent, undefined);
    return Object.assign(Object.assign({}, headers), { content: rawContent, isCompressed: false });
};
exports.getHeaderAndContent = getHeaderAndContent;
const getHeaders = (currentFile, isCompressed, offset, rawSize, rawContent, deflatedSize) => {
    const { content, path, created: creationDate, } = currentFile;
    const time = (0, convert_1.convertTime)(creationDate);
    const dt = (0, convert_1.convertDate)(creationDate);
    const crcFlag = (0, crcTable_1.getCrcFromCrc32Table)(rawContent);
    const zipSize = deflatedSize !== undefined ? deflatedSize : rawSize;
    const utfPath = utf8_encode(path);
    const isUTF8 = utfPath !== path;
    let extraFields = '';
    if (isUTF8) {
        const uExtraFieldPath = (0, convert_1.convertDecToHex)(1, 1) + (0, convert_1.convertDecToHex)((0, crcTable_1.getCrcFromCrc32Table)(utfPath), 4) + utfPath;
        extraFields = "\x75\x70" + (0, convert_1.convertDecToHex)(uExtraFieldPath.length, 2) + uExtraFieldPath;
    }
    const commonHeader = '\x14\x00' + // version needed to extract
        (isUTF8 ? '\x00\x08' : '\x00\x00') + // Language encoding flag (EFS) (12th bit turned on)
        (0, convert_1.convertDecToHex)(isCompressed ? 8 : 0, 2) + // As per ECMA-376 Part 2 specs
        (0, convert_1.convertDecToHex)(time, 2) + // last modified time
        (0, convert_1.convertDecToHex)(dt, 2) + // last modified date
        (0, convert_1.convertDecToHex)(zipSize ? crcFlag : 0, 4) +
        (0, convert_1.convertDecToHex)(deflatedSize !== null && deflatedSize !== void 0 ? deflatedSize : rawSize, 4) + // compressed size
        (0, convert_1.convertDecToHex)(rawSize, 4) + // uncompressed size
        (0, convert_1.convertDecToHex)(utfPath.length, 2) + // file name length
        (0, convert_1.convertDecToHex)(extraFields.length, 2); // extra field length
    const localFileHeader = 'PK\x03\x04' + commonHeader + utfPath + extraFields;
    const centralDirectoryHeader = 'PK\x01\x02' + // central header
        '\x14\x00' +
        commonHeader + // file header
        '\x00\x00' +
        '\x00\x00' +
        '\x00\x00' +
        (content ? '\x00\x00\x00\x00' : '\x10\x00\x00\x00') + // external file attributes
        (0, convert_1.convertDecToHex)(offset, 4) + // relative offset of local header
        utfPath + // file name
        extraFields; // extra field
    return {
        localFileHeader: Uint8Array.from(localFileHeader, c => c.charCodeAt(0)),
        centralDirectoryHeader: Uint8Array.from(centralDirectoryHeader, c => c.charCodeAt(0)),
    };
};
const buildCentralDirectoryEnd = (tLen, cLen, lLen) => {
    const str = 'PK\x05\x06' + // central folder end
        '\x00\x00' +
        '\x00\x00' +
        (0, convert_1.convertDecToHex)(tLen, 2) + // total number of entries in the central folder
        (0, convert_1.convertDecToHex)(tLen, 2) + // total number of entries in the central folder
        (0, convert_1.convertDecToHex)(cLen, 4) + // size of the central folder
        (0, convert_1.convertDecToHex)(lLen, 4) + // central folder start offset
        '\x00\x00';
    return Uint8Array.from(str, c => c.charCodeAt(0));
};
exports.buildCentralDirectoryEnd = buildCentralDirectoryEnd;
const convertStringToByteArray = (str) => {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
};
exports.convertStringToByteArray = convertStringToByteArray;
const getDecodedContent = (content) => {
    let contentToUse;
    // base64 content is passed as string
    if (typeof content === 'string') {
        const base64String = atob(content.split(';base64,')[1]);
        contentToUse = (0, exports.convertStringToByteArray)(base64String);
    }
    else {
        contentToUse = content;
    }
    return {
        size: contentToUse.length,
        content: contentToUse,
    };
};
exports.getDecodedContent = getDecodedContent;
