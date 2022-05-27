import { Group } from "../../scene/group";
import { LegendDatum } from "../legend";
import { Observable } from "../../util/observable";
import { ChartAxis, ChartAxisDirection } from "../chartAxis";
import { Chart } from "../chart";
import { createId } from "../../util/id";
import { Label } from "../label";
import { PointLabelDatum } from "../../util/labelPlacement";
import { isNumber } from "../../util/value";
import { TimeAxis } from "../axis/timeAxis";
import { Node } from '../../scene/node';

/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
    // For example, in `sectorNode.datum.seriesDatum`:
    // `sectorNode` - represents a pie slice
    // `datum` - contains metadata derived from the immutable series datum and used
    //           to set the properties of the node, such as start/end angles
    // `datum` - raw series datum, an element from the `series.data` array
    readonly series: Series;
    readonly itemId?: any;
    readonly datum: any;
    readonly point?: { // in local (series) coordinates
        readonly x: number;
        readonly y: number;
    }
}

export interface TooltipRendererParams {
    readonly datum: any;
    readonly title?: string;
    readonly color?: string;
}

export interface CartesianTooltipRendererParams extends TooltipRendererParams {
    readonly xKey: string;
    readonly xValue: any;
    readonly xName?: string;

    readonly yKey: string;
    readonly yValue: any;
    readonly yName?: string;
}

export interface PolarTooltipRendererParams extends TooltipRendererParams {
    readonly angleKey: string;
    readonly angleValue: any;
    readonly angleName?: string;

    readonly radiusKey?: string;
    readonly radiusValue?: any;
    readonly radiusName?: string;
}

export class SeriesItemHighlightStyle {
    fill?: string = 'yellow';
    stroke?: string = undefined;
    strokeWidth?: number = undefined;
}

export class SeriesHighlightStyle {
    strokeWidth?: number = undefined;
    dimOpacity?: number = undefined;
}

export class HighlightStyle {
    /**
     * @deprecated Use item.fill instead.
     */
    fill?: string = undefined;
    /**
     * @deprecated Use item.stroke instead.
     */
    stroke?: string = undefined;
    /**
    * @deprecated Use item.strokeWidth instead.
    */
    strokeWidth?: number = undefined;
    readonly item = new SeriesItemHighlightStyle();
    readonly series = new SeriesHighlightStyle();
}

export class SeriesTooltip {
    enabled = true;
}

export abstract class Series extends Observable {
    protected static readonly highlightedZIndex = 1000000000000;
    protected static readonly SERIES_LAYER_ZINDEX = 100;
    protected static readonly SERIES_HIGHLIGHT_LAYER_ZINDEX = 150;

    readonly id = createId(this);

    get type(): string {
        return (this.constructor as any).type || '';
    }

    // The group node that contains all the nodes used to render this series.
    readonly group: Group = new Group();

    // The group node that contains the series rendering in it's default (non-highlighted) state.
    readonly seriesGroup: Group = this.group.appendChild(
        new Group({ name: `${this.id}-series`, layer: true, zIndex: Series.SERIES_LAYER_ZINDEX }),
    );

    // The group node that contains all highlighted series items. This is a performance optimisation
    // for large-scale data-sets, where the only thing that routinely varies is the currently
    // highlighted node.
    readonly highlightGroup: Group = this.group.appendChild(
        new Group({ name: `${this.id}-highlight`, layer: true, zIndex: Series.SERIES_HIGHLIGHT_LAYER_ZINDEX }),
    );

    // The group node that contains all the nodes that can be "picked" (react to hover, tap, click).
    readonly pickGroup: Group = this.seriesGroup.appendChild(new Group());

    // Package-level visibility, not meant to be set by the user.
    chart?: Chart;
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;

    directions: ChartAxisDirection[] = [ChartAxisDirection.X, ChartAxisDirection.Y];
    directionKeys: { [key in ChartAxisDirection]?: string[] } = {};

    // Flag to determine if we should recalculate node data.
    protected nodeDataRefresh = true;

    readonly label = new Label();

    abstract tooltip: SeriesTooltip;

    protected _data?: any[] = undefined;
    set data(input: any[] | undefined) {
        this._data = input;
        this.nodeDataRefresh = true;
    }
    get data() {
        return this._data;
    }

    visible = true;
    showInLegend = true;

    cursor = 'default';

    set grouped(g: boolean) {
        if (g === true) {
            throw new Error(`AG Charts - grouped: true is unsupported for series of type: ${this.type}`);
        }
    }

    setColors(_fills: string[], _strokes: string[]) {
        // Override point for subclasses.
    }

    // Returns the actual keys used (to fetch the values from `data` items) for the given direction.
    getKeys(direction: ChartAxisDirection): string[] {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[direction];
        const values: string[] = [];

        if (keys) {
            keys.forEach(key => {
                const value = (this as any)[key];

                if (value) {
                    if (Array.isArray(value)) {
                        values.push(...value);
                    } else {
                        values.push(value);
                    }
                }
            });
        }

        return values;
    }

    abstract getDomain(direction: ChartAxisDirection): any[];

    // Fetch required values from the `chart.data` or `series.data` objects and process them.
    abstract processData(): boolean;

    // Using processed data, create data that backs visible nodes.
    createNodeData(): SeriesNodeDatum[] { return []; }

    // Indicate that something external changed and we should recalculate nodeData.
    markNodeDataDirty() {
        this.nodeDataRefresh = true;
    }

    // Returns persisted node data associated with the rendered portion of the series' data.
    getNodeData(): readonly SeriesNodeDatum[] { return []; }

    getLabelData(): readonly PointLabelDatum[] { return []; }

    // Produce data joins and update selection's nodes using node data.
    abstract update(): void;

    protected getOpacity(datum?: { itemId?: any }): number {
        const { 
            chart: { highlightedDatum: { series = undefined, itemId = undefined } = {} } = {},
            highlightStyle: { series: { dimOpacity = 1 } },
         } = this;

         const defaultOpacity = 1;
         const highlighting = series != null;

         if (!highlighting) {
             // Highlighting not active.
             return defaultOpacity;
         }
        
        if (series !== this) {
             // Highlighting active, this series not highlighted.
             return dimOpacity;
        }

        if (datum && itemId !== datum.itemId) {
             // Highlighting active, this series item not highlighted.
             return dimOpacity;
        }

        return defaultOpacity;
    }

    protected getStrokeWidth(defaultStrokeWidth: number, datum?: { itemId?: any }): number {
        const { 
            chart: { highlightedDatum: { series = undefined } = {}, highlightedDatum = undefined } = {},
            highlightStyle: { series: { strokeWidth } },
        } = this;

        if (strokeWidth === undefined) {
            // No change in styling for highlight cases.
            return defaultStrokeWidth;
        }

        if (!series) {
            // Current series isn't highlighted.
            return defaultStrokeWidth;
        }

        const matchesDatum = datum ?
            highlightedDatum === datum || highlightedDatum?.itemId === datum?.itemId : 
            true;
        if (series === this && matchesDatum) {
            return strokeWidth;
        }

        return defaultStrokeWidth;
    }

    abstract getTooltipHtml(seriesDatum: any): string;

    pickNode(x: number, y: number): Node | undefined {
        return this.pickGroup.pickNode(x, y);
    }

    fireNodeClickEvent(_event: MouseEvent, _datum: SeriesNodeDatum): void {
        // Override point for subclasses.
    }

    /**
     * @private
     * Populates the given {@param data} array with the items of this series
     * that should be shown in the legend. It's up to the series to determine
     * what is considered an item. An item could be the series itself or some
     * part of the series.
     * @param data
     */
    abstract listSeriesItems(data: LegendDatum[]): void;

    toggleSeriesItem(_itemId: any, enabled: boolean): void {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    }

    readonly highlightStyle = new HighlightStyle();

    protected fixNumericExtent(extent?: [number | Date, number | Date], axis?: ChartAxis): [number, number] {
        if (!extent) {
            return [0, 1];
        }

        let [min, max] = extent;
        min = +min;
        max = +max;

        if (min === 0 && max === 0) {
            // domain has zero length and the single valid value is 0. Use the default of [0, 1].
            return [0, 1];
        }

        if (min === max) {
            // domain has zero length, there is only a single valid value in data

            if (axis instanceof TimeAxis) { // numbers in domain correspond to Unix timestamps
                // automatically expand domain by 1 in each direction
                min -= 1;
                max += 1;
            } else {
                const padding = Math.abs(min * 0.01);
                min -= padding;
                max += padding;
            }
        }

        if (!(isNumber(min) && isNumber(max))) {
            return [0, 1];
        }

        return [min, max];
    }
}
