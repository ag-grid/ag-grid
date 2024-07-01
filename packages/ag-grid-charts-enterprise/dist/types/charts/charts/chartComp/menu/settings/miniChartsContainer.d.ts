import type { BeanCollection, ChartGroupsDef } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartController } from '../../chartController';
export type ThemeTemplateParameters = Map<any, any>;
export declare class MiniChartsContainer extends Component {
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private readonly fills;
    private readonly strokes;
    private readonly themeTemplateParameters;
    private readonly isCustomTheme;
    private wrappers;
    private chartController;
    private chartGroups;
    constructor(chartController: ChartController, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean, chartGroups?: ChartGroupsDef);
    postConstruct(): void;
    updateSelectedMiniChart(): void;
    destroy(): void;
}
