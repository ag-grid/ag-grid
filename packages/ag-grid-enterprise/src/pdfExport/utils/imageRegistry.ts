import type { PdfImage } from 'ag-grid-community';

import { decodeBase64 } from './bytes';
import { decodeJpeg } from './images/jpeg';
import { decodePng } from './images/png';
import type { DecodedImageData, PdfImageResource, ResolvedPdfImage } from './images/types';

const POINTS_PER_CSS_PIXEL = 72 / 96;
const DEFAULT_IMAGE_GAP = 4;

/**
 * Decode, deduplicate and size images used by one PDF export.
 */
export class PdfImageRegistry {
    private readonly resourceById = new Map<string, PdfImageResource>();

    /**
     * Resolve a public image configuration into a renderable placement.
     * @param image - Public image configuration.
     * @returns Renderable image placement.
     */
    public resolve(image: PdfImage): ResolvedPdfImage {
        const id = image.id.trim();
        if (!id) {
            throw new Error('AG Grid: PDF images require a non-empty id.');
        }

        let resource = this.resourceById.get(id);
        if (!resource) {
            const decoded = decodeImage(image);
            resource = {
                ...decoded,
                id,
                key: `Im${this.resourceById.size + 1}`,
            };
            this.resourceById.set(id, resource);
        }

        const intrinsicWidth = resource.width * POINTS_PER_CSS_PIXEL;
        const intrinsicHeight = resource.height * POINTS_PER_CSS_PIXEL;
        const configuredWidth = resolveDimension(image.width);
        const configuredHeight = resolveDimension(image.height);
        let width = configuredWidth ?? intrinsicWidth;
        let height = configuredHeight ?? intrinsicHeight;

        if (configuredWidth != null && configuredHeight == null) {
            height = configuredWidth * (resource.height / resource.width);
        } else if (configuredHeight != null && configuredWidth == null) {
            width = configuredHeight * (resource.width / resource.height);
        }

        return {
            resource,
            width,
            height,
            alignment: image.alignment ?? 'start',
            gap: resolveGap(image.gap),
            altText: image.altText,
        };
    }

    /**
     * Return every image resource used by the document.
     * @returns Registered resources in PDF resource order.
     */
    public getResources(): PdfImageResource[] {
        return Array.from(this.resourceById.values());
    }
}

/**
 * Scale an image down to a width constraint while retaining its aspect ratio.
 * @param image - Resolved image placement.
 * @param maximumWidth - Maximum rendered width in points.
 * @returns Original or constrained placement.
 */
export function constrainImageWidth(image: ResolvedPdfImage, maximumWidth: number): ResolvedPdfImage {
    if (image.width <= maximumWidth || image.width <= 0) {
        return image;
    }
    const scale = Math.max(maximumWidth, 0) / image.width;
    return {
        ...image,
        width: image.width * scale,
        height: image.height * scale,
    };
}

function decodeImage(image: PdfImage): DecodedImageData {
    const bytes = decodeBase64(image.base64);
    const imageType = image.imageType.toLowerCase();
    validateDataUrlType(image, imageType);
    if (imageType === 'png') {
        return decodePng(bytes);
    }
    if (imageType === 'jpg' || imageType === 'jpeg') {
        return decodeJpeg(bytes);
    }
    throw new Error(`AG Grid: PDF Export does not support "${image.imageType}" images.`);
}

function validateDataUrlType(image: PdfImage, imageType: string): void {
    const dataUrlType = /^data:image\/([a-z0-9.+-]+)[;,]/i.exec(image.base64)?.[1].toLowerCase();
    if (!dataUrlType) {
        return;
    }

    const isJpegMatch = dataUrlType === 'jpeg' && (imageType === 'jpg' || imageType === 'jpeg');
    if (dataUrlType !== imageType && !isJpegMatch) {
        throw new Error(
            `AG Grid: PDF image "${image.id}" is a "${dataUrlType}" data URL but its imageType is "${image.imageType}".`
        );
    }
}

function resolveDimension(value: number | undefined): number | undefined {
    return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
}

function resolveGap(value: number | undefined): number {
    return value != null && Number.isFinite(value) ? Math.max(value, 0) : DEFAULT_IMAGE_GAP;
}
