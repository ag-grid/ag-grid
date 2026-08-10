import { inflateZlib } from './inflate';
import type { DecodedImageData, PdfImageColorSpace } from './types';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
// PNG samples are embedded uncompressed and hex-encoded, so memory scales at
// roughly six bytes per RGB pixel; the cap keeps worst-case usage bounded.
const MAXIMUM_PIXEL_COUNT = 4_000_000;

interface PngMetadata {
    width: number;
    height: number;
    bitDepth: number;
    colorType: number;
    channels: number;
    colorSpace: PdfImageColorSpace;
}

/**
 * Decode a common web PNG into PDF colour and alpha samples.
 * @param data - Complete PNG file bytes.
 * @returns Decoded image samples.
 */
export function decodePng(data: Uint8Array): DecodedImageData {
    validateSignature(data);

    let metadata: PngMetadata | undefined;
    let palette: Uint8Array | undefined;
    let transparency: Uint8Array | undefined;
    const imageDataParts: Uint8Array[] = [];
    let offset = PNG_SIGNATURE.length;

    while (offset + 12 <= data.length) {
        const length = readUint32(data, offset);
        const type = readChunkType(data, offset + 4);
        const contentStart = offset + 8;
        const contentEnd = contentStart + length;
        if (contentEnd + 4 > data.length) {
            throw new Error('AG Grid: PDF image contains a truncated PNG chunk.');
        }
        const content = data.subarray(contentStart, contentEnd);

        if (type === 'IHDR') {
            metadata = readHeader(content);
        } else if (type === 'PLTE') {
            palette = content;
        } else if (type === 'tRNS') {
            transparency = content;
        } else if (type === 'IDAT') {
            imageDataParts.push(content);
        } else if (type === 'IEND') {
            break;
        }
        offset = contentEnd + 4;
    }

    if (!metadata || !imageDataParts.length) {
        throw new Error('AG Grid: PDF image is missing required PNG data.');
    }

    const compressed = concatenate(imageDataParts);
    const bitsPerPixel = metadata.bitDepth * metadata.channels;
    const scanlineLength = Math.ceil((metadata.width * bitsPerPixel) / 8);
    const expectedLength = (scanlineLength + 1) * metadata.height;
    const filtered = inflateZlib(compressed, expectedLength);
    if (filtered.length !== expectedLength) {
        throw new Error('AG Grid: PDF image PNG data does not match its dimensions.');
    }
    const bytesPerPixel = Math.max(1, Math.ceil(bitsPerPixel / 8));
    const scanlines = unfilterScanlines(filtered, scanlineLength, metadata.height, bytesPerPixel);
    const samples = unpackSamples(scanlines, metadata);
    return convertSamples(samples, metadata, palette, transparency);
}

function validateSignature(data: Uint8Array): void {
    if (data.length < PNG_SIGNATURE.length) {
        throw new Error('AG Grid: PDF image is not a valid PNG file.');
    }
    for (let index = 0; index < PNG_SIGNATURE.length; index++) {
        if (data[index] !== PNG_SIGNATURE[index]) {
            throw new Error('AG Grid: PDF image is not a valid PNG file.');
        }
    }
}

function readHeader(data: Uint8Array): PngMetadata {
    if (data.length !== 13) {
        throw new Error('AG Grid: PDF image contains an invalid PNG header.');
    }

    const width = readUint32(data, 0);
    const height = readUint32(data, 4);
    const bitDepth = data[8];
    const colorType = data[9];
    const compression = data[10];
    const filter = data[11];
    const interlace = data[12];
    const channels = getChannelCount(colorType);
    const supportedIndexedBitDepth = colorType === 3 && (bitDepth === 1 || bitDepth === 2 || bitDepth === 4);
    const supportedBitDepth = bitDepth === 8 || supportedIndexedBitDepth;

    if (width && height && height > MAXIMUM_PIXEL_COUNT / width) {
        throw new Error(
            `AG Grid: PDF PNG images are limited to ${MAXIMUM_PIXEL_COUNT.toLocaleString('en-GB')} pixels.`
        );
    }
    if (!width || !height || !supportedBitDepth || compression !== 0 || filter !== 0 || interlace !== 0 || !channels) {
        throw new Error(
            'AG Grid: PDF Export supports non-interlaced, 8-bit PNG images and 1-, 2-, or 4-bit indexed PNG images.'
        );
    }

    return {
        width,
        height,
        bitDepth,
        colorType,
        channels,
        colorSpace: colorType === 0 || colorType === 4 ? 'DeviceGray' : 'DeviceRGB',
    };
}

function getChannelCount(colorType: number): number {
    if (colorType === 0 || colorType === 3) {
        return 1;
    }
    if (colorType === 2) {
        return 3;
    }
    if (colorType === 4) {
        return 2;
    }
    if (colorType === 6) {
        return 4;
    }
    return 0;
}

function unfilterScanlines(data: Uint8Array, stride: number, height: number, bytesPerPixel: number): Uint8Array {
    const output = new Uint8Array(stride * height);
    let sourceOffset = 0;

    for (let row = 0; row < height; row++) {
        const filter = data[sourceOffset++];
        const rowOffset = row * stride;
        for (let column = 0; column < stride; column++) {
            const raw = data[sourceOffset++];
            const left = column >= bytesPerPixel ? output[rowOffset + column - bytesPerPixel] : 0;
            const above = row > 0 ? output[rowOffset + column - stride] : 0;
            const upperLeft =
                row > 0 && column >= bytesPerPixel ? output[rowOffset + column - stride - bytesPerPixel] : 0;
            let value: number;

            if (filter === 0) {
                value = raw;
            } else if (filter === 1) {
                value = raw + left;
            } else if (filter === 2) {
                value = raw + above;
            } else if (filter === 3) {
                value = raw + Math.floor((left + above) / 2);
            } else if (filter === 4) {
                value = raw + paethPredictor(left, above, upperLeft);
            } else {
                throw new Error('AG Grid: PDF image uses an invalid PNG scanline filter.');
            }
            output[rowOffset + column] = value & 0xff;
        }
    }
    return output;
}

function unpackSamples(scanlines: Uint8Array, metadata: PngMetadata): Uint8Array {
    if (metadata.bitDepth === 8) {
        return scanlines;
    }

    const samples = new Uint8Array(metadata.width * metadata.height);
    const packedStride = Math.ceil((metadata.width * metadata.bitDepth) / 8);
    const samplesPerByte = 8 / metadata.bitDepth;
    const sampleMask = (1 << metadata.bitDepth) - 1;

    for (let row = 0; row < metadata.height; row++) {
        const packedRowOffset = row * packedStride;
        const sampleRowOffset = row * metadata.width;
        for (let column = 0; column < metadata.width; column++) {
            const packed = scanlines[packedRowOffset + Math.floor(column / samplesPerByte)];
            const shift = 8 - metadata.bitDepth * ((column % samplesPerByte) + 1);
            samples[sampleRowOffset + column] = (packed >>> shift) & sampleMask;
        }
    }

    return samples;
}

function convertSamples(
    samples: Uint8Array,
    metadata: PngMetadata,
    palette: Uint8Array | undefined,
    transparency: Uint8Array | undefined
): DecodedImageData {
    const pixelCount = metadata.width * metadata.height;
    const colorChannelCount = metadata.colorSpace === 'DeviceGray' ? 1 : 3;
    const colors = new Uint8Array(pixelCount * colorChannelCount);
    const alpha = new Uint8Array(pixelCount);
    alpha.fill(255);
    let hasTransparency = false;

    for (let pixel = 0; pixel < pixelCount; pixel++) {
        const sourceOffset = pixel * metadata.channels;
        const colorOffset = pixel * colorChannelCount;

        if (metadata.colorType === 0) {
            const gray = samples[sourceOffset];
            colors[colorOffset] = gray;
            const transparentGray = transparency?.length === 2 ? readUint16(transparency, 0) : -1;
            if (gray === transparentGray) {
                alpha[pixel] = 0;
                hasTransparency = true;
            }
        } else if (metadata.colorType === 2) {
            colors[colorOffset] = samples[sourceOffset];
            colors[colorOffset + 1] = samples[sourceOffset + 1];
            colors[colorOffset + 2] = samples[sourceOffset + 2];
            if (
                transparency?.length === 6 &&
                samples[sourceOffset] === readUint16(transparency, 0) &&
                samples[sourceOffset + 1] === readUint16(transparency, 2) &&
                samples[sourceOffset + 2] === readUint16(transparency, 4)
            ) {
                alpha[pixel] = 0;
                hasTransparency = true;
            }
        } else if (metadata.colorType === 3) {
            const paletteIndex = samples[sourceOffset];
            const paletteOffset = paletteIndex * 3;
            if (!palette || paletteOffset + 2 >= palette.length) {
                throw new Error('AG Grid: PDF image contains an invalid PNG palette index.');
            }
            colors[colorOffset] = palette[paletteOffset];
            colors[colorOffset + 1] = palette[paletteOffset + 1];
            colors[colorOffset + 2] = palette[paletteOffset + 2];
            const alphaValue = transparency?.[paletteIndex] ?? 255;
            alpha[pixel] = alphaValue;
            if (alphaValue !== 255) {
                hasTransparency = true;
            }
        } else if (metadata.colorType === 4) {
            colors[colorOffset] = samples[sourceOffset];
            alpha[pixel] = samples[sourceOffset + 1];
            if (alpha[pixel] !== 255) {
                hasTransparency = true;
            }
        } else {
            colors[colorOffset] = samples[sourceOffset];
            colors[colorOffset + 1] = samples[sourceOffset + 1];
            colors[colorOffset + 2] = samples[sourceOffset + 2];
            alpha[pixel] = samples[sourceOffset + 3];
            if (alpha[pixel] !== 255) {
                hasTransparency = true;
            }
        }
    }

    return {
        width: metadata.width,
        height: metadata.height,
        colorSpace: metadata.colorSpace,
        bitsPerComponent: 8,
        data: colors,
        alpha: hasTransparency ? alpha : undefined,
    };
}

function paethPredictor(left: number, above: number, upperLeft: number): number {
    const estimate = left + above - upperLeft;
    const leftDistance = Math.abs(estimate - left);
    const aboveDistance = Math.abs(estimate - above);
    const upperLeftDistance = Math.abs(estimate - upperLeft);
    if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) {
        return left;
    }
    return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function concatenate(parts: Uint8Array[]): Uint8Array {
    let length = 0;
    for (const part of parts) {
        length += part.length;
    }
    const result = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
        result.set(part, offset);
        offset += part.length;
    }
    return result;
}

function readChunkType(data: Uint8Array, offset: number): string {
    return String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
}

function readUint16(data: Uint8Array, offset: number): number {
    return (data[offset] << 8) | data[offset + 1];
}

function readUint32(data: Uint8Array, offset: number): number {
    return data[offset] * 0x1000000 + data[offset + 1] * 0x10000 + data[offset + 2] * 0x100 + data[offset + 3];
}
