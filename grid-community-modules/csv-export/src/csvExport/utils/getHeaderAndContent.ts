import { _ } from "@ag-grid-community/core";
import { ZipFile } from "../zipContainer";
import { compressLocalFile } from "./compressLocalFile";
import { convertDate, convertTime, convertDecToHex } from "./convert";
import { getFromCrc32Table, getFromCrc32TableAndByteArray } from "./crcTable";
import { getDecodedContent } from "./getDecodedContent";

const { utf8_encode } = _;

export const getHeaderAndContent = async (currentFile: ZipFile, offset: number, compressOutput: boolean): Promise<{
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

    const shouldAttemptCompression = currentFile.type === 'file' && currentFile.canBeCompressed && compressOutput && rawContent && size > 0;
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
