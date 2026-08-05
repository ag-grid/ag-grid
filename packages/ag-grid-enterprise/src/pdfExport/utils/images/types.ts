import type { PdfImageAlignment } from 'ag-grid-community';

export type PdfImageColorSpace = 'DeviceGray' | 'DeviceRGB';

export interface PdfImageResource {
    id: string;
    key: string;
    width: number;
    height: number;
    colorSpace: PdfImageColorSpace;
    bitsPerComponent: number;
    data: Uint8Array;
    filter?: 'DCTDecode';
    alpha?: Uint8Array;
}

export interface ResolvedPdfImage {
    resource: PdfImageResource;
    width: number;
    height: number;
    alignment: PdfImageAlignment;
    gap: number;
    altText?: string;
}

export interface DecodedImageData {
    width: number;
    height: number;
    colorSpace: PdfImageColorSpace;
    bitsPerComponent: number;
    data: Uint8Array;
    filter?: 'DCTDecode';
    alpha?: Uint8Array;
}
