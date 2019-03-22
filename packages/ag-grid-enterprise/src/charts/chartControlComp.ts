import {Component, RefSelector} from "ag-grid-community";
import {BarSeries} from "./chart/series/barSeries";

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
        </div>`;

    @RefSelector('eGrouped') private eGrouped: HTMLInputElement;
    @RefSelector('eStacked') private eStacked: HTMLInputElement;

    @RefSelector('eLineWidth') private eLineWidth: HTMLInputElement;

    private barSeries: BarSeries<any>;

    constructor() {
        super(ChartControlComp.TEMPLATE);
    }

    public init(barSeries: BarSeries<any>): void {
        this.barSeries = barSeries;
        this.setupGroupedOrStacked();
        this.setupLineWidth();
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
        const valueStr = this.eLineWidth.value;
        let value: number;
        if (valueStr && valueStr.length > 0) {
            value = parseFloat(valueStr);
            if (isNaN(value)) {
                value = 1;
            }
        } else {
            value = 1;
        }
        this.barSeries.lineWidth = value;
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