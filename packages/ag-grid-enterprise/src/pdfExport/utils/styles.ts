import type { PdfCellStyle } from 'ag-grid-community';

/**
 * Merge PDF cell styles with later values taking precedence.
 * @param baseStyle - Base style.
 * @param overrideStyle - Override style.
 * @returns Merged style, or `undefined` when both inputs are empty.
 */
export function mergePdfCellStyles(
    baseStyle: PdfCellStyle | undefined,
    overrideStyle: PdfCellStyle | undefined
): PdfCellStyle | undefined {
    if (!baseStyle && !overrideStyle) {
        return undefined;
    }

    return {
        ...(baseStyle ?? {}),
        ...(overrideStyle ?? {}),
    };
}
