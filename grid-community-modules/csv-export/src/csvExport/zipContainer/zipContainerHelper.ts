import { _ } from "@ag-grid-community/core"
import { convertDate, convertDecToHex, convertTime } from "./convert";
import { ZipFile } from "./zipContainer";
import { getCrcFromCrc32Table } from "./crcTable";
import { deflateLocalFile } from "./compress";

const { utf8_encode } = _;

export type ZipFileHeaderAndContent = {
    fileHeader: Uint8Array;
    folderHeader: Uint8Array;
    content: Uint8Array;
    isCompressed: boolean;
}

export const getDeflatedHeaderAndContent = async (currentFile: ZipFile, offset: number): Promise<ZipFileHeaderAndContent> => {
    const {
        content,
        isBase64, // true for images and other base64 encoded files
    } = currentFile;

    const { size, content: rawContent } = !content
        ? ({ size: 0, content: Uint8Array.from([])})
        : getDecodedContent(content, isBase64);

    let deflatedContent: Uint8Array | undefined = undefined;
    let deflatedSize: number | undefined = undefined;
    let deflationPerformed = false;

    const shouldDeflate = currentFile.type === 'file' && !currentFile.isBase64 && rawContent && size > 0;
    if (shouldDeflate)  {
        const result = await deflateLocalFile(rawContent, isBase64);
        deflatedContent = result.content;
        deflatedSize = result.size;
        deflationPerformed = true;
    }

    const headers = getHeaders(
        currentFile,
        deflationPerformed,
        offset,
        size,
        rawContent,
        deflatedSize
    );

    return {
        ...headers,
        content: deflatedContent || rawContent,
        isCompressed: deflationPerformed,
    };
};

export const getHeaderAndContent = (currentFile: ZipFile, offset: number): ZipFileHeaderAndContent => {
    const {
        content,
        isBase64, // true for images and other base64 encoded files
    } = currentFile;

    const { content: rawContent } = !content
        ? ({ content: Uint8Array.from([]) })
        : getDecodedContent(content, isBase64);

    const headers = getHeaders(
        currentFile,
        false,
        offset,
        rawContent.length,
        rawContent,
        undefined
    );

    return {
        ...headers,
        content: rawContent,
        isCompressed: false,
    };
};

const getHeaders = (
    currentFile: ZipFile,
    isCompressed: boolean,
    offset: number,
    rawSize: number,
    rawContent: Uint8Array,
    deflatedSize: number | undefined
): {
    fileHeader: Uint8Array;
    folderHeader: Uint8Array;
} => {
    const {
        content,
        path,
        created: creationDate,
    } = currentFile;

    const time = convertTime(creationDate);
    const dt = convertDate(creationDate);

    const crcFlag = getCrcFromCrc32Table(rawContent);
    const zipSize = deflatedSize !== undefined ? deflatedSize : rawSize;

    const utfPath = utf8_encode(path);
    const isUTF8 = utfPath !== path;
    let extraFields = '';
    if (isUTF8) {
        const uExtraFieldPath = convertDecToHex(1, 1) + convertDecToHex(getCrcFromCrc32Table(utfPath), 4) + utfPath;
        extraFields = "\x75\x70" +  convertDecToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
    }

    const compressionMethod = isCompressed ? 8 : 0; // As per ECMA-376 Part 2 specs
    const header = '\x0A\x00' +
        (isUTF8 ? '\x00\x08' : '\x00\x00') +
        convertDecToHex(compressionMethod, 2) + // The file is Deflated
        convertDecToHex(time, 2) + // last modified time
        convertDecToHex(dt, 2) + // last modified date
        convertDecToHex(zipSize ? crcFlag : 0, 4) +
        convertDecToHex(deflatedSize ?? rawSize, 4) + // compressed size
        convertDecToHex(rawSize, 4) + // uncompressed size
        convertDecToHex(utfPath.length, 2) + // file name length
        convertDecToHex(extraFields.length, 2); // extra field length

    const fileHeader = 'PK\x03\x04' + header + utfPath + extraFields;
    const folderHeader =
        'PK\x01\x02' + // central header
        '\x14\x00' +
        header + // file header
        '\x00\x00' +
        '\x00\x00' +
        '\x00\x00' +
        (content ? '\x00\x00\x00\x00' : '\x10\x00\x00\x00') + // external file attributes
        convertDecToHex(offset, 4) + // relative offset of local header
        utfPath + // file name
        extraFields; // extra field

    return {
        fileHeader: Uint8Array.from(fileHeader, c => c.charCodeAt(0)),
        folderHeader: Uint8Array.from(folderHeader, c => c.charCodeAt(0)),
    };
};

export const buildFolderEnd = (tLen: number, cLen: number, lLen:number): Uint8Array => {
    const str= 'PK\x05\x06' + // central folder end
        '\x00\x00' +
        '\x00\x00' +
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(cLen, 4) + // size of the central folder
        convertDecToHex(lLen, 4) + // central folder start offset
        '\x00\x00';

    return Uint8Array.from(str, c => c.charCodeAt(0));
};

export const getDecodedContent = (content: Uint8Array, isBase64 = false): {
    size: number;
    content: Uint8Array;
} => {
    // isBase64 is true when the content is a base64 string
    // such with base64 encoded images!

    let contentToUse;
    if (isBase64) {
        const decoded = atob(String.fromCharCode(...content).split(';base64,')[1]);
        contentToUse = new TextEncoder().encode(decoded);
    } else {
        contentToUse = content;
    }

    return {
        size: contentToUse.length,
        content: contentToUse,
    };
};
