import type { DecodedImageData } from './types';

// only Huffman-coded DCT frames render through the PDF DCTDecode filter:
// baseline (C0), extended sequential (C1) and progressive (C2).
const SUPPORTED_START_OF_FRAME_MARKERS = new Set([0xc0, 0xc1, 0xc2]);
const UNSUPPORTED_START_OF_FRAME_MARKERS = new Set([0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/**
 * Read dimensions and colour information from a JPEG image.
 * @param data - Complete JPEG file bytes.
 * @returns PDF-ready JPEG image data.
 */
export function decodeJpeg(data: Uint8Array): DecodedImageData {
    if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) {
        throw new Error('AG Grid: PDF image is not a valid JPEG file.');
    }

    let index = 2;
    while (index < data.length) {
        while (index < data.length && data[index] !== 0xff) {
            index++;
        }
        while (index < data.length && data[index] === 0xff) {
            index++;
        }
        if (index >= data.length) {
            break;
        }

        const marker = data[index++];
        if (marker === 0xd9 || marker === 0xda) {
            break;
        }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            continue;
        }
        if (index + 2 > data.length) {
            break;
        }

        const segmentLength = readUint16(data, index);
        if (segmentLength < 2 || index + segmentLength > data.length) {
            throw new Error('AG Grid: PDF image contains an invalid JPEG segment.');
        }

        if (UNSUPPORTED_START_OF_FRAME_MARKERS.has(marker)) {
            throw new Error('AG Grid: PDF Export supports baseline, extended and progressive JPEG images only.');
        }
        if (SUPPORTED_START_OF_FRAME_MARKERS.has(marker)) {
            if (segmentLength < 8) {
                throw new Error('AG Grid: PDF image contains an invalid JPEG frame.');
            }
            const bitsPerComponent = data[index + 2];
            const height = readUint16(data, index + 3);
            const width = readUint16(data, index + 5);
            const componentCount = data[index + 7];
            if (bitsPerComponent !== 8 || !width || !height || (componentCount !== 1 && componentCount !== 3)) {
                throw new Error('AG Grid: PDF Export supports 8-bit greyscale and RGB JPEG images.');
            }
            return {
                width,
                height,
                colorSpace: componentCount === 1 ? 'DeviceGray' : 'DeviceRGB',
                bitsPerComponent,
                data,
                filter: 'DCTDecode',
            };
        }

        index += segmentLength;
    }

    throw new Error('AG Grid: PDF image does not contain a supported JPEG frame.');
}

function readUint16(data: Uint8Array, offset: number): number {
    return (data[offset] << 8) | data[offset + 1];
}
