// ag-grid-enterprise v21.0.1
import { Component } from "ag-grid-community";
import { ChartController } from "../chartController";
export declare class ChartDataPanel extends Component {
    static TEMPLATE: string;
    private gridOptionsWrapper;
    private columnComps;
    private dimensionComps;
    private readonly chartController;
    constructor(chartModel: ChartController);
    private init;
    private createDataGroupElements;
    private getColumnStateMapper;
    destroy(): void;
    private destroyColumnComps;
}
