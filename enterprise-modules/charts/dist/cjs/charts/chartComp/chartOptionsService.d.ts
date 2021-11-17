import { BeanStub, ChartType } from "@ag-grid-community/core";
import { ChartController } from "./chartController";
export declare class ChartOptionsService extends BeanStub {
    private readonly gridApi;
    private readonly columnApi;
    private readonly chartController;
    constructor(chartController: ChartController);
    getChartType(): ChartType;
    getChartOption<T = string>(expression: string): T;
    setChartOption<T = string>(expression: string, value: T): void;
    getAxisProperty<T = string>(expression: string): T;
    setAxisProperty<T = string>(expression: string, value: T): void;
    getLabelRotation(axisType: 'xAxis' | 'yAxis'): number;
    setLabelRotation(axisType: 'xAxis' | 'yAxis', value: number): void;
    getSeriesOption<T = string>(expression: string): T;
    setSeriesOption<T = string>(expression: string, value: T): void;
    getPairedMode(): boolean;
    setPairedMode(paired: boolean): void;
    private getChart;
    private getChartOptions;
    private getAxis;
    private updateAxisOptions;
    private raiseChartOptionsChangedEvent;
    protected destroy(): void;
}
