import type { AgSparklineOptions } from 'ag-charts-types';

import type { LocaleTextFunc } from 'ag-grid-community';

const WrappedFunctionMarker = Symbol('WrappedFunctionMarker');

type FunctionParams = (...args: any[]) => any;
type WrapperFunctionParams = (fn: FunctionParams, ...args: any[]) => any;
type SparklineTranslate = (key: string, defaultValue: string, variableValues?: string[]) => string;
type SparklineNumberFormatter = (value: number) => string;

export const wrapFn = (fn: FunctionParams, wrapperFn: WrapperFunctionParams) => {
    if ((fn as any)[WrappedFunctionMarker]) {
        return fn;
    }

    const wrapped = (...args: any[]) => wrapperFn(fn, ...args);

    wrapped[WrappedFunctionMarker] = WrappedFunctionMarker;

    return wrapped;
};

// ARIA
const defaultSparklineAriaDescription =
    'Sparkline - ${chartType} displaying ${count} values between ${min} and ${max}. Starts at ${start} and ends at ${end}.';

const defaultEmptySparklineAriaDescription = 'Sparkline - ${chartType} displaying no values.';

export const getChartTypeLabel = (translate: LocaleTextFunc, sparklineOptions?: AgSparklineOptions): string => {
    const type = sparklineOptions?.type ?? 'line';

    switch (type) {
        case 'line':
            return translate('lineChart', 'Line');
        case 'area':
            return translate('areaChart', 'Area');
        case 'bar':
            return translate('barChart', 'Bar');
        default:
            return type;
    }
};

interface SparklineSummary {
    count: number;
    min?: number;
    max?: number;
    start?: number;
    end?: number;
}
type CompleteSparklineSummary = SparklineSummary & Required<Pick<SparklineSummary, 'min' | 'max' | 'start' | 'end'>>;

type SparklineTemplateValues = Record<string, string>;

export const getSparklineSummary = (data: any[], yKey: string): SparklineSummary => {
    let count = 0;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let start: number | undefined;
    let end: number | undefined;

    for (const datum of data) {
        const yValue = getYValue(datum, yKey);
        if (yValue == null) {
            continue;
        }

        if (start == null) {
            start = yValue;
        }

        end = yValue;
        count++;
        min = Math.min(min, yValue);
        max = Math.max(max, yValue);
    }

    return count === 0 ? { count } : { count, min, max, start, end };
};

export function getSparklineAriaTemplate(params: {
    translate: SparklineTranslate;
    chartType: string;
    summary: SparklineSummary;
    formatNumber: SparklineNumberFormatter;
}): { template: string; values: SparklineTemplateValues } {
    const { translate, chartType, summary, formatNumber } = params;

    if (!hasCompleteSparklineSummary(summary)) {
        const variableValues = [chartType];
        return {
            template: translate(
                'ariaSparklineChartDescriptionEmpty',
                defaultEmptySparklineAriaDescription,
                variableValues
            ),
            values: { chartType },
        };
    }

    const [count, min, max, start, end] = [summary.count, summary.min, summary.max, summary.start, summary.end].map(
        formatNumber
    );
    const variableValues = [chartType, count, min, max, start, end];

    return {
        template: translate('ariaSparklineChartDescription', defaultSparklineAriaDescription, variableValues),
        values: { chartType, count, min, max, start, end },
    };
}

const hasCompleteSparklineSummary = (summary: SparklineSummary): summary is CompleteSparklineSummary =>
    summary.count > 0 && summary.min != null && summary.max != null && summary.start != null && summary.end != null;

export const interpolateTemplate = (template: string, values: SparklineTemplateValues): string =>
    template.replace(/\$\{([^}]+)\}/g, (match, token: string) => values[token] ?? match);

const getYValue = (datum: any, yKey: string): number | null => {
    if (typeof datum === 'number') {
        return Number.isFinite(datum) ? datum : null;
    }

    if (datum && typeof datum === 'object') {
        const yValue = Array.isArray(datum) ? datum[1] : datum[yKey];
        return typeof yValue === 'number' && Number.isFinite(yValue) ? yValue : null;
    }

    return null;
};
