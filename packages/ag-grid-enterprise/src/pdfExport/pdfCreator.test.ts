import { vi } from 'vitest';

import type { PdfDocumentHeadingStyle, PdfExportParams } from 'ag-grid-community';

import { PdfCreator } from './pdfCreator';
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

const getComputedColor = (root: HTMLElement, value: string): string => {
    const probe = document.createElement('span');
    probe.style.color = value;
    root.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return computed;
};

describe('PdfCreator', () => {
    it('inherits the grid text direction unless the export direction is specified', () => {
        const creator = new PdfCreator() as unknown as {
            getMergedParams: (params?: PdfExportParams) => PdfExportParams;
            gos: { get: (key: string) => unknown };
            beans: { eRootDiv: HTMLElement };
        };
        const root = document.createElement('div');
        let enableRtl = true;
        creator.gos = {
            get: (key: string) => (key === 'enableRtl' ? enableRtl : undefined),
        };
        creator.beans = { eRootDiv: root };

        expect(creator.getMergedParams().direction).toBe('rtl');

        enableRtl = false;
        expect(creator.getMergedParams().direction).toBe('ltr');
        expect(creator.getMergedParams({ direction: 'auto' }).direction).toBe('auto');
        expect(creator.getMergedParams({ direction: 'ltr' }).direction).toBe('ltr');
        expect(creator.getMergedParams({ direction: 'rtl' }).direction).toBe('rtl');
    });

    it('resolves theme colour tokens in merged default cell and header styles', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);
        const creator = new PdfCreator() as unknown as {
            getMergedParams: (params?: PdfExportParams) => PdfExportParams;
            gos: { get: (key: string) => unknown };
            beans: { eRootDiv: HTMLElement };
        };
        creator.gos = {
            get: (key: string) =>
                key === 'defaultPdfExportParams' ? { defaultCellStyle: { color: 'red', padding: 6 } } : undefined,
        };
        creator.beans = { eRootDiv: root };

        const merged = creator.getMergedParams({ defaultHeaderStyle: { backgroundColor: '#00ff00' } });

        expect(merged.defaultCellStyle).toEqual({ color: getComputedColor(root, 'red'), padding: 6 });
        expect(merged.defaultHeaderStyle?.backgroundColor).toBe(getComputedColor(root, '#00ff00'));

        root.remove();
    });

    it('does not return PDF data when PDF export is suppressed', () => {
        const creator = new PdfCreator() as unknown as {
            getDataAsPdf: (params?: PdfExportParams) => Blob | undefined;
            gos: { get: (key: string) => unknown };
            beans: { log: { warn: ReturnType<typeof vi.fn> } };
            getData: (params: PdfExportParams) => string;
        };
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        let getDataCalled = false;

        creator.gos = {
            get: (key: string) => key === 'suppressPdfExport',
        };
        creator.beans = { log: { warn: vi.fn() } };
        creator.getData = () => {
            getDataCalled = true;
            return '';
        };

        try {
            expect(creator.getDataAsPdf()).toBeUndefined();
            expect(getDataCalled).toBe(false);
        } finally {
            warnSpy.mockRestore();
        }
    });

    it('merges default and override document title styles', () => {
        const baseStyle: PdfDocumentHeadingStyle = { fontSize: 12, alignment: 'left' };
        const overrideStyle: PdfDocumentHeadingStyle = { alignment: 'center' };

        expect(mergeDocumentHeadingStyle(baseStyle, overrideStyle)).toEqual({ fontSize: 12, alignment: 'center' });
        expect(mergeDocumentHeadingStyle(baseStyle, undefined)).toBe(baseStyle);
        expect(mergeDocumentHeadingStyle(undefined, overrideStyle)).toBe(overrideStyle);
    });

    it('resolves document title colours to computed values', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);

        const style: PdfDocumentHeadingStyle = {
            color: 'red',
            backgroundColor: '#00ff00',
            borderColor: 'rgb(10, 20, 30)',
        };

        const expectedColor = getComputedColor(root, 'red');
        const expectedBackground = getComputedColor(root, '#00ff00');
        const expectedBorder = getComputedColor(root, 'rgb(10, 20, 30)');

        const resolved = resolveDocumentHeadingStyleColors(style, (value) => resolveThemeColorValue(value, root));

        expect(resolved?.color).toBe(expectedColor);
        expect(resolved?.backgroundColor).toBe(expectedBackground);
        expect(resolved?.borderColor).toBe(expectedBorder);

        root.remove();
    });

    it('merges header and footer rules independently', () => {
        const base = {
            all: {
                header: [{ value: 'Header' }],
                footer: [{ value: 'Base footer' }],
            },
        };
        const override = {
            all: {
                footer: [{ value: 'Override footer' }],
            },
            first: {
                header: [{ value: 'First header' }],
            },
        };

        expect(mergeHeaderFooterConfig(base, override)).toEqual({
            all: {
                header: [{ value: 'Header' }],
                footer: [{ value: 'Override footer' }],
            },
            first: {
                header: [{ value: 'First header' }],
            },
        });
    });

    it('resolves header and footer text colours', () => {
        const resolved = resolveHeaderFooterConfigColors(
            {
                all: {
                    header: [{ value: 'Header', style: { color: 'red' } }],
                },
            },
            () => 'rgb(255, 0, 0)'
        );

        expect(resolved?.all?.header?.[0].style?.color).toBe('rgb(255, 0, 0)');
    });

    it('merges watermark configuration and nested text styles', () => {
        expect(
            mergeWatermark(
                {
                    text: 'DRAFT',
                    opacity: 0.1,
                    style: { fontSize: 72, color: 'grey' },
                },
                {
                    text: 'CONFIDENTIAL',
                    style: { fontWeight: 'bold' },
                }
            )
        ).toEqual({
            text: 'CONFIDENTIAL',
            opacity: 0.1,
            style: { fontSize: 72, color: 'grey', fontWeight: 'bold' },
        });
    });

    it('resolves watermark text colours', () => {
        const resolved = resolveWatermarkColors(
            {
                text: 'DRAFT',
                style: { color: 'var(--ag-foreground-color)' },
            },
            () => 'rgb(100, 110, 120)'
        );

        expect(resolved?.style?.color).toBe('rgb(100, 110, 120)');
    });

    it('reads the computed header text colour when no header text theme variable is available', () => {
        const root = document.createElement('div');
        const header = document.createElement('div');
        header.className = 'ag-header';
        header.style.color = 'rgb(220, 230, 240)';
        root.appendChild(header);
        document.body.appendChild(root);

        expect(getThemePdfColors(root).headerTextColor).toBe('rgb(220, 230, 240)');

        root.remove();
    });

    it('preserves an inherited odd-row background when overriding the data background', () => {
        const colors = resolvePdfColors(
            { dataBackgroundColor: '#ffffff', oddRowBackgroundColor: '#ffffff' },
            { dataBackgroundColor: '#1e1e1e' },
            undefined,
            (value) => value
        );

        expect(colors.dataBackgroundColor).toBe('#1e1e1e');
        expect(colors.oddRowBackgroundColor).toBe('#1e1e1e');
    });

    it('preserves a distinct theme odd-row background when overriding the data background', () => {
        const colors = resolvePdfColors(
            { dataBackgroundColor: '#ffffff', oddRowBackgroundColor: '#f5f5f5' },
            { dataBackgroundColor: '#1e1e1e' },
            undefined,
            (value) => value
        );

        expect(colors.dataBackgroundColor).toBe('#1e1e1e');
        expect(colors.oddRowBackgroundColor).toBe('#f5f5f5');
    });

    it('uses an explicit odd-row export background independently of the data background', () => {
        const colors = resolvePdfColors(
            { dataBackgroundColor: '#ffffff', oddRowBackgroundColor: '#ffffff' },
            { dataBackgroundColor: '#1e1e1e', oddRowBackgroundColor: '#303030' },
            undefined,
            (value) => value
        );

        expect(colors.dataBackgroundColor).toBe('#1e1e1e');
        expect(colors.oddRowBackgroundColor).toBe('#303030');
    });
});
