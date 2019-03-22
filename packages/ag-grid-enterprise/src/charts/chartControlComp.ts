import {Component, RefSelector} from "ag-grid-community";
import {BarSeries} from "./chart/series/barSeries";
import {CartesianChart} from "./chart/cartesianChart";

export class ChartControlComp extends Component {

    private static TEMPLATE =
        `<div class="ag-chart-control">
            <label style="margin-right: 10px;">
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

    @RefSelector('eWidth') private eWidth: HTMLInputElement;
    @RefSelector('eHeight') private eHeight: HTMLInputElement;

    private barSeries: BarSeries<any>;
    private chart: CartesianChart<any, string, number>;

    constructor() {
        super(ChartControlComp.TEMPLATE);
    }

    public init(barSeries: BarSeries<any>, chart: CartesianChart<any, string, number>): void {
        this.barSeries = barSeries;
        this.chart = chart;
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
        if (this.barSeries.lineWidth>=0) {
            this.eLineWidth.value = `${this.barSeries.lineWidth}`;
        } else {
            this.eLineWidth.value = '';
        }
        this.addDestroyableEventListener(this.eLineWidth, 'input', this.onLineWidth.bind(this));
    }

    private onLineWidth(): void {
        const width = this.getNumberValue(this.eLineWidth, 1);
        this.barSeries.lineWidth = width!;
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

        if (this.barSeries.grouped) {
            this.eGrouped.checked = true;
        } else {
            this.eStacked.checked = true;
        }
    }

    private onStackedOrGroupedChanged(): void {
        this.barSeries.grouped = this.eGrouped.checked;
    }
}