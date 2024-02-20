import { BeanStub, ChartType } from "ag-grid-community";
import { ChartController } from "../chartController";
import { ChartSeriesType } from "../utils/seriesTypeMapper";
export declare class ChartOptionsService extends BeanStub {
    private readonly chartController;
    constructor(chartController: ChartController);
    getChartOption<T = string>(expression: string): T;
    setChartOption<T = string>(expression: string, value: T, isSilent?: boolean): void;
    awaitChartOptionUpdate(func: () => void): void;
    getAxisProperty<T = string>(expression: string): T;
    setAxisProperty<T = string>(expression: string, value: T): void;
    setAxisProperties<T = string>(properties: Array<{
        expression: string;
        value: T;
    }>): void;
    getLabelRotation(axisType: 'xAxis' | 'yAxis'): number;
    setLabelRotation(axisType: 'xAxis' | 'yAxis', value: number | undefined): void;
    getSeriesOption<T = string>(expression: string, seriesType: ChartSeriesType, calculated?: boolean): T;
    setSeriesOption<T = string>(expression: string, value: T, seriesType: ChartSeriesType): void;
    getPairedMode(): boolean;
    setPairedMode(paired: boolean): void;
    private getAxis;
    private getUpdateAxisOptions;
    getChartType(): ChartType;
    private getChart;
    private updateChart;
    private createChartOptions;
    private raiseChartOptionsChangedEvent;
    private static isMatchingSeries;
    protected destroy(): void;
}
