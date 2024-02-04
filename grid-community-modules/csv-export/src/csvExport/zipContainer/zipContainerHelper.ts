import { _ } from "@ag-grid-community/core"
import { convertDate, convertDecToHex, convertTime } from "./convert";
import { ZipFile } from "./zipContainer";
import { getFromCrc32Table, getFromCrc32TableAndByteArray } from "./crcTable";
import { compressLocalFile } from "./compress";

const { utf8_encode } = _;


export const buildFolderEnd = (tLen: number, cLen: number, lLen:number): string => {
    return 'PK\x05\x06' + // central folder end
        '\x00\x00' +
        '\x00\x00' +
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(cLen, 4) + // size of the central folder
        convertDecToHex(lLen, 4) + // central folder start offset
        '\x00\x00';
};

export const getCompressedHeaderAndContent = async (currentFile: ZipFile, offset: number): Promise<{
    fileHeader: string;
    folderHeader: string;
    content: string | Uint8Array;
    isCompressed: boolean;
}> => {
    const {
        content,
        path,
        created: creationDate,
        isBase64, // true for images and other base64 encoded files
    } = currentFile;

    const utfPath = utf8_encode(path);
    const isUTF8 = utfPath !== path;
    const time = convertTime(creationDate);
    const dt = convertDate(creationDate);

    let extraFields = '';

    if (isUTF8) {
        const uExtraFieldPath = convertDecToHex(1, 1) + convertDecToHex(getFromCrc32Table(utfPath), 4) + utfPath;
        extraFields = "\x75\x70" +  convertDecToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
    }

    const { size, content: rawContent } = !content
        ? ({ size: 0, content: ''})
        : getDecodedContent(content, isBase64);

    let compressedContent: Uint8Array | undefined = undefined;
    let compressedSize: number | undefined = undefined;
    let compressionPerformed = false;

    const shouldAttemptCompression = currentFile.type === 'file' && !currentFile.isBase64 && currentFile.path.indexOf('worksheets') !== -1 && rawContent && size > 0;
    if (shouldAttemptCompression)  {
        const result = await compressLocalFile(rawContent, isBase64);
        compressedContent = result.content;
        compressedSize = result.size;
        compressionPerformed = true;
    }

    if (
        (compressionPerformed && (!compressedContent || !compressedSize))
        || (!compressionPerformed && (compressedContent || compressedSize))
    ) {
        throw new Error('Compression result is invalid!');
    }

    const contentToUse = compressedContent !== undefined ? compressedContent : rawContent;
    const crcFlag = compressedContent !== undefined ? getFromCrc32TableAndByteArray(compressedContent) : getFromCrc32Table(rawContent);
    const sizeToUse = compressedSize !== undefined ? compressedSize : size;
    const compressionMethod = compressionPerformed ? 8 : 0; // As per ECMA-376 Part 2 specs

    const header = '\x0A\x00' +
        (isUTF8 ? '\x00\x08' : '\x00\x00') +
        convertDecToHex(compressionMethod, 2) + // The file is Deflated
        convertDecToHex(time, 2) + // last modified time
        convertDecToHex(dt, 2) + // last modified date
        convertDecToHex(sizeToUse ? crcFlag : 0, 4) +
        convertDecToHex(compressedSize ?? size, 4) + // compressed size
        convertDecToHex(size, 4) + // uncompressed size
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
        fileHeader,
        folderHeader,
        content: contentToUse || '',
        isCompressed: compressionPerformed,
    };
};

export const getHeaderAndContent = (currentFile: ZipFile, offset: number): {
    fileHeader: string;
    folderHeader: string;
    content: string | Uint8Array;
    isCompressed: boolean;
} => {
    const {
        content,
        path,
        created: creationDate,
        isBase64, // true for images and other base64 encoded files
    } = currentFile;

    const utfPath = utf8_encode(path);
    const isUTF8 = utfPath !== path;
    const time = convertTime(creationDate);
    const dt = convertDate(creationDate);

    let extraFields = '';

    if (isUTF8) {
        const uExtraFieldPath = convertDecToHex(1, 1) + convertDecToHex(getFromCrc32Table(utfPath), 4) + utfPath;
        extraFields = "\x75\x70" +  convertDecToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
    }

    const { size, content: rawContent } = !content
        ? ({ size: 0, content: ''})
        : getDecodedContent(content, isBase64);

    const contentToUse = rawContent;
    const crcFlag = getFromCrc32Table(rawContent);
    const sizeToUse = size;
    const compressionMethod = 0; // As per ECMA-376 Part 2 specs

    const header = '\x0A\x00' +
        (isUTF8 ? '\x00\x08' : '\x00\x00') +
        convertDecToHex(compressionMethod, 2) + // The file is Deflated
        convertDecToHex(time, 2) + // last modified time
        convertDecToHex(dt, 2) + // last modified date
        convertDecToHex(sizeToUse ? crcFlag : 0, 4) +
        convertDecToHex(size, 4) + // compressed size
        convertDecToHex(size, 4) + // uncompressed size
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
        fileHeader,
        folderHeader,
        content: contentToUse || '',
        isCompressed: false,
    };
};

export const getDecodedContent = (content: string, isBase64 = false): { size: number; content: string } => {
    // isBase64 is true when the content is a base64 string
    // such with base64 encoded images!

    const decodedContent = isBase64
        ? atob(content.split(';base64,')[1])
        : content;

    return {
        size: decodedContent.length,
        content: decodedContent,
    };
};
