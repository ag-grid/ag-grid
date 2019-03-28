import {Component, RefSelector} from "ag-grid-community";
import {Chart} from "../charts/chart/chart";
import {BarSeries} from "../charts/chart/series/barSeries";
import {ChartType} from "./gridChartFactory";

export class ChartControlComp extends Component {

    private static TEMPLATE =
        `<div class="ag-chart-control">
            <label style="margin-left: 150px; margin-top: 10px">
                <input type="radio" ref="eStacked"/>
                Stacked
            </label>                
            <label style="margin-right: 10px;">
                <input type="radio" ref="eGrouped"/>
                Grouped
            </label>
            <span style="margin-right: 10px;">
                Line Width
                <input type="text" ref="eLineWidth" style="width: 40px;"/>
            </span>
            <span style="margin-right: 10px;">
                Width
                <input type="text" ref="eWidth" style="width: 40px;"/>
                Height
                <input type="text" ref="eHeight" style="width: 40px;"/>
            </span>
        </div>`;

    @RefSelector('eGrouped') private eGrouped: HTMLInputElement;
    @RefSelector('eStacked') private eStacked: HTMLInputElement;

    @RefSelector('eLineWidth') private eLineWidth: HTMLInputElement;

    @RefSelector('eWidth') public eWidth: HTMLInputElement;
    @RefSelector('eHeight') public eHeight: HTMLInputElement;

    private chart: Chart<any, string, number>;

    constructor() {
        super(ChartControlComp.TEMPLATE);
    }

    public init(chartType: ChartType, gridChart: Chart<any, string, number>): void {
        this.chart = gridChart;

        this.setupGroupedOrStacked();
        this.setupLineWidth();
        this.setupWidthAndHeight();
    }

    private setupWidthAndHeight(): void {
        this.eWidth.value = `${this.chart.width}`;
        this.eHeight.value = `${this.chart.height}`;

        this.addDestroyableEventListener(this.eWidth, 'input', this.onWidthChanged.bind(this));
        this.addDestroyableEventListener(this.eHeight, 'input', this.onHeightChanged.bind(this));
    }

    private onWidthChanged(): void {
        const width = this.getNumberValue(this.eWidth, null);
        if (width) {
            this.chart.width = width;
        }
    }

    private onHeightChanged(): void {
        const height = this.getNumberValue(this.eHeight, null);
        if (height) {
            this.chart.height = height;
        }
    }

    private setupLineWidth(): void {
        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;
        if (barSeries.lineWidth>=0) {
            this.eLineWidth.value = `${barSeries.lineWidth}`;
        } else {
            this.eLineWidth.value = '';
        }
        this.addDestroyableEventListener(this.eLineWidth, 'input', this.onLineWidth.bind(this));
    }

    private onLineWidth(): void {
        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;
        const width = this.getNumberValue(this.eLineWidth, 1);
        barSeries.lineWidth = width!;
    }

    private getNumberValue(textInput: HTMLInputElement, defaultValue: number | null): number | null {
        const valueStr = textInput.value;
        let value: number;
        if (valueStr && valueStr.length > 0) {
            value = parseFloat(valueStr);
            if (isNaN(value)) {
                return defaultValue;
            } else {
                return value;
            }
        } else {
            return defaultValue;
        }
    }

    private setupGroupedOrStacked(): void {
        const groupName = `agGroupedOrStacked-${this.getCompId()}`;
        [this.eGrouped, this.eStacked].forEach( e => {
            e.setAttribute('name', groupName);
            this.addDestroyableEventListener(e, 'change', this.onStackedOrGroupedChanged.bind(this));
        });

        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;

        if (barSeries.grouped) {
            this.eGrouped.checked = true;
        } else {
            this.eStacked.checked = true;
        }
    }

    private onStackedOrGroupedChanged(): void {
        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;
        barSeries.grouped = this.eGrouped.checked;
    }
}