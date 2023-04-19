import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../services/chartOptionsService";
export declare class BackgroundPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private group;
    private colorPicker;
    private chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initGroup;
    private initColorPicker;
}
