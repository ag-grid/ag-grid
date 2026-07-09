import { _downloadFile } from 'ag-stack';

import type { IPdfCreator, NamedBean, PdfCustomContent, PdfExportParams } from 'ag-grid-community';
import { BaseCreator, _addGridCommonParams } from 'ag-grid-community';

import { PdfSerializingSession } from './pdfSerializingSession';
import {
    getThemePdfStyles,
    mergeDocumentTitle,
    resolveDocumentTitleColors,
    resolvePdfStyles,
    resolveThemeColorValue,
} from './utils/creator';

/**
 * Orchestrates PDF export by serialising grid data and downloading a file.
 * Style defaults are resolved from the active grid theme.
 */
export class PdfCreator
    extends BaseCreator<PdfCustomContent, PdfSerializingSession, PdfExportParams>
    implements NamedBean, IPdfCreator
{
    beanName = 'pdfCreator' as const;

    /**
     * Merge default params with user params and resolve PDF styles.
     * @param params - Optional export params provided by the caller.
     * @returns The merged params with resolved theme styles applied.
     */
    protected getMergedParams(params?: PdfExportParams): PdfExportParams {
        const baseParams = this.gos.get('defaultPdfExportParams');
        const resolveColor = this.getResolveColorValueFn();
        const merged: PdfExportParams = { ...(baseParams ?? {}), ...(params ?? {}) };
        merged.pdfStyles = resolvePdfStyles(
            getThemePdfStyles(this.beans.eRootDiv),
            baseParams?.pdfStyles,
            params?.pdfStyles,
            resolveColor
        );
        const mergedDocumentTitle = mergeDocumentTitle(baseParams?.documentTitle, params?.documentTitle);
        merged.documentTitle = resolveDocumentTitleColors(mergedDocumentTitle, resolveColor);
        return merged;
    }

    /**
     * Run the export pipeline and trigger a download.
     * @param userParams - Optional export params to use for this export.
     */
    protected export(userParams?: PdfExportParams): void {
        if (this.isExportSuppressed()) {
            this.warn(160);
            return;
        }

        const exportFunc = () => {
            const mergedParams = this.getMergedParams(userParams);
            const data = this.getData(mergedParams);
            const mimeType = mergedParams.mimeType || 'application/pdf';

            const packagedFile = new Blob([data], { type: mimeType });
            const fileNameParams = mergedParams.fileName;
            const fileName =
                typeof fileNameParams === 'function'
                    ? fileNameParams(_addGridCommonParams(this.gos, {}))
                    : fileNameParams;

            _downloadFile(this.getFileName(fileName), packagedFile);
        };

        const { overlays } = this.beans;
        if (overlays) {
            // Match other exporters by showing a transient export overlay.
            overlays.showExportOverlay(exportFunc);
        } else {
            exportFunc();
        }
    }

    /**
     * Export and download a PDF file.
     * @param params - Optional export params to use for this export.
     */
    public exportDataAsPdf(params?: PdfExportParams): void {
        this.export(params);
    }

    /**
     * Return the PDF file as a Blob without downloading it.
     * @param params - Optional export params to use for this export.
     * @returns The generated PDF as a Blob, or undefined if export is unavailable.
     */
    public getDataAsPdf(params?: PdfExportParams): Blob | undefined {
        if (this.isExportSuppressed()) {
            this.warn(160);
            return undefined;
        }

        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);
        const mimeType = mergedParams.mimeType || 'application/pdf';

        return new Blob([data], { type: mimeType });
    }

    /**
     * File extension used by PDF export.
     * @returns The file extension for PDF exports.
     */
    public getDefaultFileExtension(): string {
        return 'pdf';
    }

    /**
     * Create a serialising session for the grid exporter.
     * @param params - Export params to drive serialisation.
     * @returns A configured serialising session instance.
     */
    public createSerializingSession(params?: PdfExportParams): PdfSerializingSession {
        const { colModel, colNames, rowGroupColsSvc, valueSvc, gos, log } = this.beans;
        const { processCellCallback, processHeaderCallback, processGroupHeaderCallback, processRowGroupCallback } =
            params ?? {};
        const resolveColor = this.getResolveColorValueFn();

        return new PdfSerializingSession({
            ...params,
            colModel,
            colNames,
            rowGroupColsSvc,
            valueSvc,
            gos,
            log,
            resolveColor,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
        });
    }

    /**
     * Check if PDF export is suppressed by grid options.
     * @returns True when export is disabled, otherwise false.
     */
    public isExportSuppressed(): boolean {
        return this.gos.get('suppressPdfExport');
    }

    private getResolveColorValueFn(): (value?: string) => string | undefined {
        const { eRootDiv } = this.beans;
        const resolvedColorByValue = new Map<string, string | undefined>();

        return (value?: string) => {
            if (!value) {
                return undefined;
            }

            const cachedValue = resolvedColorByValue.get(value);
            if (cachedValue !== undefined || resolvedColorByValue.has(value)) {
                return cachedValue;
            }

            const resolvedValue = resolveThemeColorValue(value, eRootDiv);
            resolvedColorByValue.set(value, resolvedValue);

            return resolvedValue;
        };
    }
}
