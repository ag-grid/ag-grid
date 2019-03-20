// ag-grid-enterprise v20.2.0
import { Component } from "ag-grid-community";
export interface ChartOptions {
    width: number;
    height: number;
    datasource: ChartDatasource;
}
export interface ChartDatasource {
    getCategory(i: number): string;
    getFields(): string[];
    getFieldNames(): string[];
    getValue(i: number, field: string): number;
    getRowCount(): number;
    destroy(): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
}
export declare class Chart_Old extends Component {
    private chartOptions;
    private readonly eCanvas;
    private datasource;
    constructor(chartOptions: ChartOptions);
    refresh(): void;
    destroy(): void;
    private drawChart;
}
export declare class Chart extends Component {
    private chartOptions;
    private datasource;
    private chart;
    private barSeries;
    private eChart;
    private eErrors;
    constructor(chartOptions: ChartOptions);
    private setupChart;
    refresh(): void;
    destroy(): void;
    private drawChart;
}
