import { Component } from "@ag-grid-community/core";
import { ChartMenu } from "./menu/chartMenu";
import { Chart } from "ag-charts-community";
import { ChartProxy } from "./chartProxies/chartProxy";
export declare class TitleEdit extends Component {
    private readonly chartMenu;
    private static TEMPLATE;
    private chartTranslator;
    private chartProxy;
    private destroyableChartListeners;
    constructor(chartMenu: ChartMenu);
    init(): void;
    setChartProxy(chartProxy: ChartProxy<Chart, any>): void;
    private startEditing;
    private endEditing;
}
