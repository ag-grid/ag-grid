import { ChartGroupsDef, Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
export type ThemeTemplateParameters = {
    extensions: Map<any, any>;
    properties: Map<any, any>;
};
export declare class MiniChartsContainer extends Component {
    static TEMPLATE: string;
    private readonly fills;
    private readonly strokes;
    private readonly themeTemplateParameters;
    private readonly isCustomTheme;
    private wrappers;
    private chartController;
    private chartGroups;
    private chartTranslationService;
    constructor(chartController: ChartController, fills: string[], strokes: string[], themeTemplateParameters: ThemeTemplateParameters, isCustomTheme: boolean, chartGroups?: ChartGroupsDef);
    private init;
    updateSelectedMiniChart(): void;
}
