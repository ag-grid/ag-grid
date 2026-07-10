import { vi } from 'vitest';

import type { PdfCell, PdfExportParams } from 'ag-grid-community';

import { PdfCreator } from './pdfCreator';
import { mergeDocumentTitle, resolveDocumentTitleColors, resolveThemeColorValue } from './utils/creator';

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

    it('merges a base title string into a style-only override', () => {
        const overrideTitle: PdfCell = {
            data: { value: null },
            style: { fontSize: 12 },
        };

        const merged = mergeDocumentTitle('Quarterly Results', overrideTitle) as PdfCell;

        expect(merged.data.value).toBe('Quarterly Results');
        expect(merged.style?.fontSize).toBe(12);
    });

    it('resolves document title colours to computed values', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);

        const title: PdfCell = {
            data: { value: 'Report' },
            style: {
                color: 'red',
                backgroundColor: '#00ff00',
                borderColor: 'rgb(10, 20, 30)',
            },
        };

        const expectedColor = getComputedColor(root, 'red');
        const expectedBackground = getComputedColor(root, '#00ff00');
        const expectedBorder = getComputedColor(root, 'rgb(10, 20, 30)');

        const resolved = resolveDocumentTitleColors(title, (value) => resolveThemeColorValue(value, root)) as PdfCell;

        expect(resolved.style?.color).toBe(expectedColor);
        expect(resolved.style?.backgroundColor).toBe(expectedBackground);
        expect(resolved.style?.borderColor).toBe(expectedBorder);

        root.remove();
    });
});
