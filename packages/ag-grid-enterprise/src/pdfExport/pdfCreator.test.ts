import { describe, expect, it } from '@jest/globals';

import type { PdfCell } from 'ag-grid-community';

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
