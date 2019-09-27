// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
export declare class ChartDataPanel extends Component {
    static TEMPLATE: string;
    private chartTranslator;
    private columnComps;
    private dimensionComps;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private createDataGroupElements;
    private getColumnStateMapper;
    destroy(): void;
    private destroyColumnComps;
}
