import { _utf8_encode } from 'ag-grid-community';

import { deflateLocalFile } from './compress';
import { convertDate, convertDecToHex, convertTime } from './convert';
import { getCrcFromCrc32Table } from './crcTable';
import type { ZipFile } from './zipContainer';

interface ZipFileHeader {
    localFileHeader: Uint8Array;
    centralDirectoryHeader: Uint8Array;
}

export interface ProcessedZipFile extends ZipFileHeader {
    content: Uint8Array;
    isCompressed: boolean;
}

const getHeaders = (
    currentFile: ZipFile,
    isCompressed: boolean,
    offset: number,
    rawSize: number,
    rawContent: string | Uint8Array,
    deflatedSize: number | undefined
): ZipFileHeader => {
    const { content, path, created: creationDate } = currentFile;

    const time = convertTime(creationDate);
    const dt = convertDate(creationDate);

    const crcFlag = getCrcFromCrc32Table(rawContent);
    const zipSize = deflatedSize !== undefined ? deflatedSize : rawSize;

    const utfPath = _utf8_encode(path);
    const isUTF8 = utfPath !== path;

    let extraFields = '';
    if (isUTF8) {
        const uExtraFieldPath = convertDecToHex(1, 1) + convertDecToHex(getCrcFromCrc32Table(utfPath), 4) + utfPath;
        extraFields = '\x75\x70' + convertDecToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
    }

    const commonHeader =
        '\x14\x00' + // version needed to extract
        (isUTF8 ? '\x00\x08' : '\x00\x00') + // Language encoding flag (EFS) (12th bit turned on)
        convertDecToHex(isCompressed ? 8 : 0, 2) + // As per ECMA-376 Part 2 specs
        convertDecToHex(time, 2) + // last modified time
        convertDecToHex(dt, 2) + // last modified date
        convertDecToHex(zipSize ? crcFlag : 0, 4) +
        convertDecToHex(deflatedSize ?? rawSize, 4) + // compressed size
        convertDecToHex(rawSize, 4) + // uncompressed size
        convertDecToHex(utfPath.length, 2) + // file name length
        convertDecToHex(extraFields.length, 2); // extra field length

    const localFileHeader = 'PK\x03\x04' + commonHeader + utfPath + extraFields;
    const centralDirectoryHeader =
        'PK\x01\x02' + // central header
        '\x14\x00' +
        commonHeader + // file header
        '\x00\x00' +
        '\x00\x00' +
        '\x00\x00' +
        (content ? '\x00\x00\x00\x00' : '\x10\x00\x00\x00') + // external file attributes
        convertDecToHex(offset, 4) + // relative offset of local header
        utfPath + // file name
        extraFields; // extra field

    return {
        localFileHeader: Uint8Array.from(localFileHeader, (c) => c.charCodeAt(0)),
        centralDirectoryHeader: Uint8Array.from(centralDirectoryHeader, (c) => c.charCodeAt(0)),
    };
};

const getDecodedContent = (
    content: string | Uint8Array
): {
    size: number;
    content: Uint8Array;
} => {
    let contentToUse: Uint8Array;
    // base64 content is passed as string
    if (typeof content === 'string') {
        const base64String = atob(content.split(';base64,')[1]);
        contentToUse = Uint8Array.from(base64String, (c) => c.charCodeAt(0));
    } else {
        contentToUse = content;
    }

    return {
        size: contentToUse.length,
        content: contentToUse,
    };
};

export const getDeflatedHeaderAndContent = async (currentFile: ZipFile, offset: number): Promise<ProcessedZipFile> => {
    const { content } = currentFile;

    const { size, content: rawContent } = !content
        ? { size: 0, content: Uint8Array.from([]) }
        : getDecodedContent(content);

    let deflatedContent: Uint8Array | undefined = undefined;
    let deflatedSize: number | undefined = undefined;
    let deflationPerformed = false;

    const shouldDeflate = currentFile.type === 'file' && rawContent && size > 0;
    if (shouldDeflate) {
        const result = await deflateLocalFile(rawContent);
        deflatedContent = result.content;
        deflatedSize = result.size;
        deflationPerformed = true;
    }

    const headers = getHeaders(currentFile, deflationPerformed, offset, size, rawContent, deflatedSize);

    return {
        ...headers,
        content: deflatedContent || rawContent,
        isCompressed: deflationPerformed,
    };
};

export const getHeaderAndContent = (currentFile: ZipFile, offset: number): ProcessedZipFile => {
    const { content } = currentFile;

    const { content: rawContent } = !content ? { content: Uint8Array.from([]) } : getDecodedContent(content);

    const headers = getHeaders(currentFile, false, offset, rawContent.length, rawContent, undefined);

    return {
        ...headers,
        content: rawContent,
        isCompressed: false,
    };
};

export const buildCentralDirectoryEnd = (tLen: number, cLen: number, lLen: number): Uint8Array => {
    const str =
        'PK\x05\x06' + // central folder end
        '\x00\x00' +
        '\x00\x00' +
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(cLen, 4) + // size of the central folder
        convertDecToHex(lLen, 4) + // central folder start offset
        '\x00\x00';

    return Uint8Array.from(str, (c) => c.charCodeAt(0));
};
