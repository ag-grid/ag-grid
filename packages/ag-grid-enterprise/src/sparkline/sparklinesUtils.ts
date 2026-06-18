import type { AgSparklineOptions } from 'ag-charts-types';
import type { LocaleTextFunc } from 'ag-stack';

import { _isFiniteNumber } from 'ag-grid-community';

type SparklineTranslate = (key: string, defaultValue: string, variableValues?: string[]) => string;
type SparklineNumberFormatter = (value: number) => string;

// ARIA
const defaultSparklineAriaDescription =
    'Sparkline - ${chartType} displaying ${count} values between ${min} and ${max}. Starts at ${start} and ends at ${end}.';

const defaultSingleValueSparklineAriaDescription = 'Sparkline - ${chartType} displaying 1 value, ${value}.';

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

    let key: string;
    let defaultTemplate: string;
    let variableValues: string[];
    let values: SparklineTemplateValues;

    if (!hasCompleteSparklineSummary(summary)) {
        key = 'ariaSparklineChartDescriptionEmpty';
        defaultTemplate = defaultEmptySparklineAriaDescription;
        variableValues = [chartType];
        values = { chartType };
    } else if (summary.count === 1) {
        const value = formatNumber(summary.start);
        key = 'ariaSparklineChartDescriptionSingleValue';
        defaultTemplate = defaultSingleValueSparklineAriaDescription;
        variableValues = [chartType, value];
        values = { chartType, value };
    } else {
        const [count, min, max, start, end] = [summary.count, summary.min, summary.max, summary.start, summary.end].map(
            formatNumber
        );
        key = 'ariaSparklineChartDescription';
        defaultTemplate = defaultSparklineAriaDescription;
        variableValues = [chartType, count, min, max, start, end];
        values = { chartType, count, min, max, start, end };
    }

    return { template: translate(key, defaultTemplate, variableValues), values };
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
        return _isFiniteNumber(yValue) ? yValue : null;
    }

    return null;
};
