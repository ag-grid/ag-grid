import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class BackgroundPanel extends Component {
    static TEMPLATE: string;
    private group;
    private colorPicker;
    private chartTranslator;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initGroup;
    private initColorPicker;
}
