import { Group } from "../../scene/group";
import { Chart } from "../chart";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { FontStyle, FontWeight } from "../../scene/shape/text";

/**
 * `D` - raw series datum, an element in the {@link Series.data} array.
 * `SeriesNodeDatum` - processed series datum used in node selections,
 *                     contains information used to render pie sectors, bars, line markers, etc.
 */
export interface SeriesNodeDatum {
    seriesDatum: any;
}

export interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

export class SeriesLabel {
    onChange?: () => void;

    private _enabled: boolean = true;
    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.update();
        }
    }
    get enabled(): boolean {
        return this._enabled;
    }

    private _fontStyle?: FontStyle;
    set fontStyle(value: FontStyle | undefined) {
        if (this._fontStyle !== value) {
            this._fontStyle = value;
            this.update();
        }
    }
    get fontStyle(): FontStyle | undefined {
        return this._fontStyle;
    }

    private _fontWeight?: FontWeight;
    set fontWeight(value: FontWeight | undefined) {
        if (this._fontWeight !== value) {
            this._fontWeight = value;
            this.update();
        }
    }
    get fontWeight(): FontWeight | undefined {
        return this._fontWeight;
    }

    private _fontSize: number = 12;
    set fontSize(value: number) {
        if (this._fontSize !== value) {
            this._fontSize = value;
            this.update();
        }
    }
    get fontSize(): number {
        return this._fontSize;
    }

    private _fontFamily: string = 'Verdana, sans-serif';
    set fontFamily(value: string) {
        if (this._fontFamily !== value) {
            this._fontFamily = value;
            this.update();
        }
    }
    get fontFamily(): string {
        return this._fontFamily;
    }

    private _color: string = 'black';
    set color(value: string) {
        if (this._color !== value) {
            this._color = value;
            this.update();
        }
    }
    get color(): string {
        return this._color;
    }

    protected update() {
        if (this.onChange) {
            this.onChange();
        }
    }
}

export abstract class Series<C extends Chart> {

    readonly id: string = this.createId();

    /**
     * The group node that contains all the nodes used to render this series.
     */
    readonly group: Group = new Group();

    // Uniquely identify series.
    private createId(): string {
        const constructor = this.constructor as any;
        const className = constructor.className;
        if (!className) {
            throw new Error(`The ${constructor} is missing the 'className' property.`);
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    }

    protected _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        this.scheduleData();
    }
    get data(): any[] {
        return this._data;
    }

    protected _chart?: C;
    abstract set chart(chart: C | undefined);
    abstract get chart(): C | undefined;

    protected _visible: boolean = true;
    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this.scheduleData();
        }
    }
    get visible(): boolean {
        return this._visible;
    }

    abstract getDomainX(): any[];
    abstract getDomainY(): any[];

    abstract processData(): boolean;
    abstract update(): void;

    abstract getTooltipHtml(nodeDatum: SeriesNodeDatum): string;

    tooltipEnabled: boolean = false;

    /**
     * @private
     * Populates the given {@param data} array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     * @param data
     */
    abstract listSeriesItems(data: LegendDatum[]): void;

    toggleSeriesItem(itemId: any, enabled: boolean): void {
        this.visible = enabled;
    }

    private _showInLegend: boolean = true;
    set showInLegend(value: boolean) {
        if (this._showInLegend !== value) {
            this._showInLegend = value;
            this.scheduleLayout();
        }
    }
    get showInLegend(): boolean {
        return this._showInLegend;
    }

    abstract highlightNode(node: Shape): void;
    abstract dehighlightNode(): void;

    scheduleLayout() {
        if (this.chart) {
            this.chart.layoutPending = true;
        }
    }

    scheduleData() {
        if (this.chart) {
            this.chart.dataPending = true;
        }
    }
}
