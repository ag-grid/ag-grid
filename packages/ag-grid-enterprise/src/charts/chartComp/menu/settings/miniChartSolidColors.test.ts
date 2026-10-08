import type { AgColorType } from 'ag-charts-types';

import { toSolidColors } from './miniChartSolidColors';

describe('toSolidColors', () => {
    test('keeps string colours as they are', () => {
        expect(toSolidColors(['#5090dc', 'red', 'rgba(1, 2, 3, 0.5)'])).toEqual([
            '#5090dc',
            'red',
            'rgba(1, 2, 3, 0.5)',
        ]);
    });

    test('uses the first stop colour of a gradient', () => {
        const palette: AgColorType[] = [{ type: 'gradient', colorStops: [{ color: 'red' }, { color: 'blue' }] }];
        expect(toSolidColors(palette)).toEqual(['red']);
    });

    test('uses the fill of a pattern', () => {
        const palette: AgColorType[] = [{ type: 'pattern', pattern: 'vertical-lines', fill: 'green' }];
        expect(toSolidColors(palette)).toEqual(['green']);
    });

    test('falls back to the first string colour in the palette', () => {
        const palette: AgColorType[] = [
            { type: 'gradient', colorStops: [{ stop: 0 }, { color: 'blue' }] },
            { type: 'gradient', colorStops: [] },
            { type: 'pattern', pattern: 'stars' },
            { type: 'image', url: 'https://example.com/a.png' },
            { ref: 'foregroundColor' } as AgColorType,
            '#123456',
            '#654321',
        ];
        expect(toSolidColors(palette)).toEqual([
            '#123456',
            '#123456',
            '#123456',
            '#123456',
            '#123456',
            '#123456',
            '#654321',
        ]);
    });

    test('falls back to gray when the palette has no string colour', () => {
        const palette: AgColorType[] = [
            { type: 'pattern', pattern: 'stars' },
            { type: 'image', url: 'a.png' },
        ];
        expect(toSolidColors(palette)).toEqual(['gray', 'gray']);
    });

    test('returns an empty list for an empty palette', () => {
        expect(toSolidColors([])).toEqual([]);
    });
});
