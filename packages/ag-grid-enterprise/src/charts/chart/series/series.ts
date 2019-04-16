import { Group } from "../../scene/group";
import { Chart } from "../chart";
import { LegendDatum } from "../legend";

/**
 * `D` - raw series datum, an element in the {@link Series.data} array.
 * `SeriesNodeDatum` - processed series datum used in node selections,
 *                     contains information used to render pie sectors, bars, line markers, etc.
 */
export interface SeriesNodeDatum<D = any> {
    seriesDatum: D;
}

export abstract class Series<D, X, Y> {

    readonly id: string = this.createId();

    protected _name: string = '';
    set name(value: string) {
        if (this._name !== value) {
            this._name = value;
        }
    }
    get name(): string {
        return this._name;
    }

    protected _title: string | string[] = '';
    set title(value: string | string[]) {
        this._title = value;
    }
    get title(): string | string[] {
        return this._title;
    }

    /**
     * The group node that contains all the nodes used to render this series.
     */
    readonly group: Group = new Group();

    // Uniquely identify series.
    private createId(): string {
        const constructor = this.constructor as any;
        return constructor.name + '-' + (constructor.id = (constructor.id || 0) + 1);
    };

    // abstract set data(data: D[]);
    // abstract get data(): D[];
    //
    protected _data: D[] = [];
    set data(data: D[]) {
        this._data = data;
        this.scheduleLayout();
    }
    get data(): D[] {
        return this._data;
    }

    protected _chart: Chart<D, X, Y> | null = null;
    abstract set chart(chart: Chart<D, X, Y> | null);
    abstract get chart(): Chart<D, X, Y> | null;

    private _visible: boolean = true;
    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this.scheduleLayout();
        }
    }
    get visible(): boolean {
        return this._visible;
    }

    abstract getDomainX(): any[];
    abstract getDomainY(): any[];

    abstract processData(): boolean;
    abstract update(): void;

    abstract getTooltipHtml(nodeDatum: SeriesNodeDatum<D>): string;

    tooltip: boolean = false;

    abstract provideLegendData(data: LegendDatum[]): void;

    scheduleLayout() {
        if (this.chart) {
            this.chart.layoutPending = true;
        }
    }
}
