import type { BeanCollection, PdfExportParams } from 'ag-grid-community';

export function getDataAsPdf(beans: BeanCollection, params?: PdfExportParams): Blob | undefined {
    return beans.pdfCreator?.getDataAsPdf(params);
}

export function exportDataAsPdf(beans: BeanCollection, params?: PdfExportParams): Promise<void> {
    return beans.pdfCreator?.exportDataAsPdf(params) ?? Promise.resolve();
}
