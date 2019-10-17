import { Group } from "../../scene/group";
import { Chart } from "../chart";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { FontStyle, FontWeight } from "../../scene/shape/text";
import { Marker } from "../marker/marker";
import { Color } from "../../util/color";
import palette from "../palettes";

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

    protected _enabled: boolean = true;
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

class SeriesMarker {
    onChange?: () => void;
    onTypeChange?: () => void;

    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    private _type?: (new () => Marker) = undefined;
    set type(value: (new () => Marker) | undefined) {
        if (this._type !== value) {
            this._type = value;
            if (this.onTypeChange) {
                this.onTypeChange();
            }
        }
    }
    get type(): (new () => Marker) | undefined {
        return this._type;
    }

    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `minSize/size` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[minSize, size]` range, where the largest values will correspond to the `size`
     * and the lowest to the `minSize`.
     */
    private _size: number = 8;
    set size(value: number) {
        if (this._size !== value) {
            this._size = value;
            this.update();
        }
    }
    get size(): number {
        return this._size;
    }

    private _minSize: number = 4;
    set minSize(value: number) {
        if (this._minSize !== value) {
            this._minSize = value;
            this.update();
        }
    }
    get minSize(): number {
        return this._minSize;
    }

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

    // private _xOffset: number = 0;
    // set xOffset(value: number) {
    //     if (this._xOffset !== value) {
    //         this._xOffset = value;
    //         this.update();
    //     }
    // }
    // get xOffset(): number {
    //     return this._xOffset;
    // }

    // private _yOffset: number = 0;
    // set yOffset(value: number) {
    //     if (this._yOffset !== value) {
    //         this._yOffset = value;
    //         this.update();
    //     }
    // }
    // get yOffset(): number {
    //     return this._yOffset;
    // }

    private _fill: string | undefined = palette.fills[0];
    set fill(value: string | undefined) {
        if (this._fill !== value) {
            this._fill = value;
            this.stroke = Color.fromString(value).darker().toHexString();
            this.update();
        }
    }
    get fill(): string | undefined {
        return this._fill;
    }

    private _stroke: string | undefined = palette.strokes[0];
    set stroke(value: string | undefined) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.update();
        }
    }
    get stroke(): string | undefined {
        return this._stroke;
    }

    private _strokeWidth: number | undefined = undefined;
    set strokeWidth(value: number | undefined) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number | undefined {
        return this._strokeWidth;
    }

    private _fillOpacity: number = 1;
    set fillOpacity(value: number) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.update();
        }
    }
    get fillOpacity(): number {
        return this._fillOpacity;
    }

    private _strokeOpacity: number = 1;
    set strokeOpacity(value: number) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.update();
        }
    }
    get strokeOpacity(): number {
        return this._strokeOpacity;
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

    readonly marker = new SeriesMarker();

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
