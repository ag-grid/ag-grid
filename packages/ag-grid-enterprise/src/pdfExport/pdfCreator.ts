import { _downloadFile } from 'ag-stack';

import type { IPdfCreator, NamedBean, PdfCustomContent, PdfExportParams } from 'ag-grid-community';
import { BaseCreator } from 'ag-grid-community';

import { PdfSerializingSession } from './pdfSerializingSession';
import { resolvePdfCellStyleColors } from './utils/colors';
import { PdfFontFamilyNotRegisteredError } from './utils/fontRegistry';
import {
    getThemePdfColors,
    mergeDocumentHeadingStyle,
    mergeHeaderFooterConfig,
    mergeWatermark,
    resolveDocumentHeadingStyleColors,
    resolveHeaderFooterConfigColors,
    resolvePdfColors,
    resolveThemeColorValue,
    resolveWatermarkColors,
} from './utils/pdfStyleResolver';
import { mergePdfCellStyles } from './utils/styles';

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
        merged.direction ??= this.gos.get('enableRtl') ? 'rtl' : 'ltr';
        merged.colors = resolvePdfColors(
            getThemePdfColors(this.beans.eRootDiv),
            baseParams?.colors,
            params?.colors,
            resolveColor
        );
        if (baseParams?.page && params?.page) {
            merged.page = { ...baseParams.page, ...params.page };
        }
        merged.defaultCellStyle = resolvePdfCellStyleColors(
            mergePdfCellStyles(baseParams?.defaultCellStyle, params?.defaultCellStyle),
            resolveColor
        );
        merged.defaultHeaderStyle = resolvePdfCellStyleColors(
            mergePdfCellStyles(baseParams?.defaultHeaderStyle, params?.defaultHeaderStyle),
            resolveColor
        );
        const mergedTitleStyle = mergeDocumentHeadingStyle(baseParams?.documentTitleStyle, params?.documentTitleStyle);
        merged.documentTitleStyle = resolveDocumentHeadingStyleColors(mergedTitleStyle, resolveColor);
        const mergedSubtitleStyle = mergeDocumentHeadingStyle(
            baseParams?.documentSubtitleStyle,
            params?.documentSubtitleStyle
        );
        merged.documentSubtitleStyle = resolveDocumentHeadingStyleColors(mergedSubtitleStyle, resolveColor);
        const mergedHeaderFooterConfig = mergeHeaderFooterConfig(
            baseParams?.headerFooterConfig,
            params?.headerFooterConfig
        );
        merged.headerFooterConfig = resolveHeaderFooterConfigColors(mergedHeaderFooterConfig, resolveColor);
        const mergedWatermark = mergeWatermark(baseParams?.watermark, params?.watermark);
        merged.watermark = resolveWatermarkColors(mergedWatermark, resolveColor);
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

        this.runExport(() => {
            const mergedParams = this.getMergedParams(userParams);
            const blob = this.createPdfBlob(mergedParams);
            if (blob) {
                _downloadFile(this.resolveFileName(mergedParams), blob);
            }
        });
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

        return this.createPdfBlob(this.getMergedParams(params));
    }

    private createPdfBlob(mergedParams: PdfExportParams): Blob | undefined {
        try {
            const data = this.getData(mergedParams);
            return new Blob([data], { type: mergedParams.mimeType || 'application/pdf' });
        } catch (error) {
            if (error instanceof PdfFontFamilyNotRegisteredError) {
                this.error(330, {
                    fontFamily: error.family,
                    registeredFamilies: error.registeredFamilies,
                });
                return undefined;
            }
            throw error;
        }
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
