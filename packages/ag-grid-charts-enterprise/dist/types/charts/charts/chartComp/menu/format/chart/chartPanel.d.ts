import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
export declare class ChartPanel extends Component {
    static TEMPLATE: string;
    private chartTranslationService;
    private readonly chartMenuUtils;
    private readonly chartController;
    private readonly isExpandedOnInit;
    constructor({ chartController, chartMenuParamsFactory: chartMenuUtils, isExpandedOnInit }: FormatPanelOptions);
    private init;
}
