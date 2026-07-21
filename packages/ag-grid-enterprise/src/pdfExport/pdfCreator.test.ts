import { vi } from 'vitest';

import type { PdfDocumentTitleStyle, PdfExportParams } from 'ag-grid-community';

import { PdfCreator } from './pdfCreator';
import {
    getThemePdfColors,
    mergeDocumentTitleStyle,
    resolveDocumentTitleStyleColors,
    resolveThemeColorValue,
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
        const baseStyle: PdfDocumentTitleStyle = { fontSize: 12, alignment: 'left' };
        const overrideStyle: PdfDocumentTitleStyle = { alignment: 'center' };

        expect(mergeDocumentTitleStyle(baseStyle, overrideStyle)).toEqual({ fontSize: 12, alignment: 'center' });
        expect(mergeDocumentTitleStyle(baseStyle, undefined)).toBe(baseStyle);
        expect(mergeDocumentTitleStyle(undefined, overrideStyle)).toBe(overrideStyle);
    });

    it('resolves document title colours to computed values', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);

        const style: PdfDocumentTitleStyle = {
            color: 'red',
            backgroundColor: '#00ff00',
            borderColor: 'rgb(10, 20, 30)',
        };

        const expectedColor = getComputedColor(root, 'red');
        const expectedBackground = getComputedColor(root, '#00ff00');
        const expectedBorder = getComputedColor(root, 'rgb(10, 20, 30)');

        const resolved = resolveDocumentTitleStyleColors(style, (value) => resolveThemeColorValue(value, root));

        expect(resolved?.color).toBe(expectedColor);
        expect(resolved?.backgroundColor).toBe(expectedBackground);
        expect(resolved?.borderColor).toBe(expectedBorder);

        root.remove();
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
});
