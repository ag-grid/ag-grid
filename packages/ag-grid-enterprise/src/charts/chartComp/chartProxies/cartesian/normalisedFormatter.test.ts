import type {
    AgAxisLabelFormatterParams,
    AgCartesianAxisOptions,
    AgCartesianChartOptions,
    AnyFormatterSource,
    FormatterParams,
} from 'ag-charts-types';

import { applyNormalisedFormatting, mergeThemeFormatters } from './normalisedFormatter';

type FunctionFormatter = (params: FormatterParams) => unknown;

function params(source: AnyFormatterSource, property: 'x' | 'y' = 'y') {
    return { type: 'number', source, property, value: 49.6 } as FormatterParams;
}

function createNormalisedFormatter(themeFormatter: AgCartesianChartOptions['formatter']) {
    return applyNormalisedFormatting({}, { type: 'number' }, themeFormatter, false).formatter;
}

const poundFormatter = (p: FormatterParams) => `£${p.value}`;

describe('createNormalisedFormatter', () => {
    test.each<AnyFormatterSource>(['axis-label', 'crosshair'])('adds a percentage to %s values', (source) => {
        const formatter = createNormalisedFormatter(undefined) as FunctionFormatter;
        expect(formatter(params(source))).toBe('50%');
    });

    test.each<AnyFormatterSource>(['tooltip', 'series-label', 'legend-label'])(
        'leaves %s values to the default formatting',
        (source) => {
            const formatter = createNormalisedFormatter(undefined) as FunctionFormatter;
            expect(formatter(params(source))).toBeUndefined();
        }
    );

    test('a theme function formatter formats everything except percentage axis values', () => {
        const formatter = createNormalisedFormatter(poundFormatter) as FunctionFormatter;
        expect(formatter(params('axis-label'))).toBe('50%');
        expect(formatter(params('tooltip'))).toBe('£49.6');
        expect(formatter(params('series-label'))).toBe('£49.6');
        expect(formatter(params('axis-label', 'x'))).toBe('£49.6');
    });

    test('a theme y format string is left to format everything, and the value axis label adds the percentage', () => {
        const valueAxis: AgCartesianAxisOptions = { type: 'number' };
        const options = applyNormalisedFormatting({}, valueAxis, { y: ',.0f' }, false);
        expect(options.formatter).toBeUndefined();
        const tickParams = { type: 'number', value: 49.6, index: 0 } as AgAxisLabelFormatterParams;
        expect(valueAxis.label?.formatter?.(tickParams)).toBe('50%');
    });

    test('a theme y format string leaves the value axis label to a theme value axis label format', () => {
        const valueAxis: AgCartesianAxisOptions = { type: 'number' };
        applyNormalisedFormatting({}, valueAxis, { y: ',.0f' }, true);
        expect(valueAxis.label).toBeUndefined();
    });

    test('a theme y format string removes a formatter installed by an earlier update', () => {
        const options = applyNormalisedFormatting(
            { formatter: poundFormatter },
            { type: 'number' },
            { y: ',.0f' },
            false
        );
        expect(options).not.toHaveProperty('formatter');
    });

    test('a theme formatter keyed by property keeps its other properties', () => {
        const themeFormatter: AgCartesianChartOptions['formatter'] = { x: poundFormatter, y: poundFormatter };
        const formatter = createNormalisedFormatter(themeFormatter) as Record<'x' | 'y', FunctionFormatter>;
        expect(formatter.x).toBe(poundFormatter);
        expect(formatter.y(params('axis-label'))).toBe('50%');
        expect(formatter.y(params('tooltip'))).toBe('£49.6');
    });
});

describe('mergeThemeFormatters', () => {
    const otherFormatter = (p: FormatterParams) => `#${p.value}`;

    test('merges formatters keyed by property, the first defined property winning', () => {
        expect(mergeThemeFormatters([{ x: poundFormatter }, undefined, { x: otherFormatter, y: ',.0f' }])).toEqual({
            x: poundFormatter,
            y: ',.0f',
        });
    });

    test('a function formatter replaces formatters of lower priority', () => {
        expect(mergeThemeFormatters([poundFormatter, { y: otherFormatter }])).toBe(poundFormatter);
        expect(mergeThemeFormatters([undefined, undefined])).toBeUndefined();
    });
});
