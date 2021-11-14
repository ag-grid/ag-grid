import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class BackgroundPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private group;
    private colorPicker;
    private chartTranslator;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initGroup;
    private initColorPicker;
}
