import type { ChartType } from 'ag-grid-community';
import type { ThemeTemplateParameters } from '../../miniChartsContainer';
import { MiniStackedArea } from './miniStackedArea';
export declare class MiniNormalizedArea extends MiniStackedArea {
    static chartType: ChartType;
    static readonly data: number[][];
    constructor(container: HTMLElement, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean, data?: number[][]);
}
