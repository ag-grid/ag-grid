import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
export declare class LegendPanel extends Component {
    static TEMPLATE: string;
    private readonly chartTranslationService;
    private readonly chartMenuUtils;
    private readonly isExpandedOnInit;
    constructor({ chartMenuParamsFactory: chartMenuUtils, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private getSliderParams;
    private createLabelPanel;
}
