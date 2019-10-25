import { Group } from "../../scene/group";
import { Chart } from "../chart";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Marker } from "../marker/marker";
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
export declare class SeriesMarker {
    onChange?: () => void;
    onTypeChange?: () => void;
    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    private _type?;
    type: (new () => Marker) | undefined;
    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `minSize/size` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[minSize, size]` range, where the largest values will correspond to the `size`
     * and the lowest to the `minSize`.
     */
    private _size;
    size: number;
    private _minSize;
    minSize: number;
    private _enabled;
    enabled: boolean;
    private _fill;
    fill: string | undefined;
    private _stroke;
    stroke: string | undefined;
    private _strokeWidth;
    strokeWidth: number | undefined;
    private _fillOpacity;
    fillOpacity: number;
    private _strokeOpacity;
    strokeOpacity: number;
    protected update(): void;
}
export declare abstract class Series<C extends Chart> {
    readonly id: string;
    /**
     * The group node that contains all the nodes used to render this series.
     */
    readonly group: Group;
    private createId;
    protected _data: any[];
    data: any[];
    protected _chart?: C;
    abstract chart: C | undefined;
    protected _visible: boolean;
    visible: boolean;
    abstract getDomainX(): any[];
    abstract getDomainY(): any[];
    abstract processData(): boolean;
    abstract update(): void;
    abstract getTooltipHtml(nodeDatum: SeriesNodeDatum): string;
    tooltipEnabled: boolean;
    readonly marker: SeriesMarker;
    /**
     * @private
     * Populates the given {@param data} array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     * @param data
     */
    abstract listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: any, enabled: boolean): void;
    private _showInLegend;
    showInLegend: boolean;
    abstract highlightNode(node: Shape): void;
    abstract dehighlightNode(): void;
    scheduleLayout(): void;
    scheduleData(): void;
}
