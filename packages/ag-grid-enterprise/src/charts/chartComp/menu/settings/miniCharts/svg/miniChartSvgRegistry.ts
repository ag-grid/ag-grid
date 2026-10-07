import type { ChartType } from 'ag-grid-community';

import { plainSlotColor } from './miniChartSvgColors';
import { MINI_CHART_SVG_TEMPLATES } from './miniChartSvgTemplates.generated';
import type { MiniChartSvgColorFn, MiniChartSvgTemplate } from './miniChartSvgTypes';

const COLOR_OVERRIDES: Partial<Record<ChartType, MiniChartSvgColorFn>> = {};

export function getMiniChartSvg(
    chartType: ChartType
): { template: MiniChartSvgTemplate; colors: MiniChartSvgColorFn } | undefined {
    const template = MINI_CHART_SVG_TEMPLATES[chartType];
    return template ? { template, colors: COLOR_OVERRIDES[chartType] ?? plainSlotColor } : undefined;
}
