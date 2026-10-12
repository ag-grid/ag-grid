import type { AnyFormatterSource, FormatterParams } from 'ag-charts-types';

import { NORMALISED_CHART_FORMATTER } from './normalisedFormatter';

const formatY = (NORMALISED_CHART_FORMATTER as Record<'y', (params: FormatterParams) => unknown>).y;

function format(source: AnyFormatterSource) {
    return formatY({ type: 'number', source, property: 'y', value: 49.6 } as FormatterParams);
}

describe('NORMALISED_CHART_FORMATTER', () => {
    test.each<AnyFormatterSource>(['axis-label', 'crosshair'])('adds a percentage to %s values', (source) => {
        expect(format(source)).toBe('50%');
    });

    test.each<AnyFormatterSource>(['tooltip', 'series-label', 'legend-label'])(
        'leaves %s values to the default formatting',
        (source) => {
            expect(format(source)).toBeUndefined();
        }
    );
});
