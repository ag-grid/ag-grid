// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { BarChartProxy } from "../../../chartProxies/cartesian/barChartProxy";
import { PieChartProxy } from "../../../chartProxies/polar/pieChartProxy";
import { DoughnutChartProxy } from "../../../chartProxies/polar/doughnutChartProxy";
import { AreaChartProxy } from "../../../chartProxies/cartesian/areaChartProxy";
declare type ShadowProxy = BarChartProxy | AreaChartProxy | PieChartProxy | DoughnutChartProxy;
export declare class ShadowPanel extends Component {
    static TEMPLATE: string;
    private shadowGroup;
    private shadowColorPicker;
    private shadowBlurSlider;
    private shadowXOffsetSlider;
    private shadowYOffsetSlider;
    private chartTranslator;
    private chartProxy;
    constructor(chartProxy: ShadowProxy);
    private init;
    private initSeriesShadow;
}
export {};
