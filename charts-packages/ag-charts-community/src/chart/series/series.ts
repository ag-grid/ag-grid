import { Group } from '../../scene/group';
import { LegendDatum } from '../legend';
import { Observable } from '../../util/observable';
import { ChartAxis, ChartAxisDirection } from '../chartAxis';
import { Chart } from '../chart';
import { createId } from '../../util/id';
import { Label } from '../label';
import { isNumber } from '../../util/value';
import { TimeAxis } from '../axis/timeAxis';
import { Deprecated } from '../../util/validation';
import { PointLabelDatum } from '../../util/labelPlacement';
import { Layers } from '../layers';

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
    readonly series: Series<any>;
    readonly itemId?: any;
    readonly datum: any;
    readonly point?: {
        // in local (series) coordinates
        readonly x: number;
        readonly y: number;
    };
}

/** Modes of matching user interactions to rendered nodes (e.g. hover or click) */
export enum SeriesNodePickMode {
    /** Pick matches based upon pick coordinates being inside a matching shape/marker. */
    EXACT_SHAPE_MATCH,
    /** Pick matches by nearest category/X-axis value, then distance within that category/X-value. */
    NEAREST_BY_MAIN_AXIS_FIRST,
    /** Pick matches by nearest category value, then distance within that category. */
    NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
    /** Pick matches based upon distance to ideal position */
    NEAREST_NODE,
}

export type SeriesNodePickMatch = {
    datum: SeriesNodeDatum;
    distance: number;
};

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
    enabled?: boolean = undefined;
}

export class HighlightStyle {
    /**
     * @deprecated Use item.fill instead.
     */
    @Deprecated('Use item.fill instead.')
    fill?: string = undefined;
    /**
     * @deprecated Use item.stroke instead.
     */
    @Deprecated('Use item.stroke instead.')
    stroke?: string = undefined;
    /**
     * @deprecated Use item.strokeWidth instead.
     */
    @Deprecated('Use item.strokeWidth instead.')
    strokeWidth?: number = undefined;
    readonly item = new SeriesItemHighlightStyle();
    readonly series = new SeriesHighlightStyle();
}

export class SeriesTooltip {
    enabled = true;
}

export type SeriesNodeDataContext<S = SeriesNodeDatum, L = S> = {
    itemId: string;
    nodeData: S[];
    labelData: L[];
};

export abstract class Series<C extends SeriesNodeDataContext = SeriesNodeDataContext> extends Observable {
    protected static readonly highlightedZIndex = 1000000000000;

    readonly id = createId(this);

    get type(): string {
        return (this.constructor as any).type || '';
    }

    // The group node that contains all the nodes used to render this series.
    readonly group: Group = new Group();

    // The group node that contains the series rendering in it's default (non-highlighted) state.
    readonly seriesGroup: Group;

    // The group node that contains all highlighted series items. This is a performance optimisation
    // for large-scale data-sets, where the only thing that routinely varies is the currently
    // highlighted node.
    readonly highlightGroup: Group;
    readonly highlightNode: Group;
    readonly highlightLabel: Group;

    // The group node that contains all the nodes that can be "picked" (react to hover, tap, click).
    readonly pickGroup: Group;

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

    protected _visible = true;
    set visible(value: boolean) {
        this._visible = value;
        this.visibleChanged();
    }
    get visible() {
        return this._visible;
    }

    showInLegend = true;
    pickModes: SeriesNodePickMode[];

    cursor = 'default';

    constructor({ seriesGroupUsesLayer = true, pickModes = [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST] } = {}) {
        super();

        const { group } = this;
        this.seriesGroup = group.appendChild(
            new Group({
                name: `${this.id}-series`,
                layer: seriesGroupUsesLayer,
                zIndex: Layers.SERIES_LAYER_ZINDEX,
            })
        );
        this.pickGroup = this.seriesGroup.appendChild(new Group());

        this.highlightGroup = group.appendChild(
            new Group({
                name: `${this.id}-highlight`,
                layer: true,
                zIndex: Layers.SERIES_HIGHLIGHT_LAYER_ZINDEX,
                optimiseDirtyTracking: true,
            })
        );
        this.highlightNode = this.highlightGroup.appendChild(new Group());
        this.highlightLabel = this.highlightGroup.appendChild(new Group());
        this.highlightNode.zIndex = 0;
        this.highlightLabel.zIndex = 10;

        this.pickModes = pickModes;
    }

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
            keys.forEach((key) => {
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
    abstract processData(): void;

    // Using processed data, create data that backs visible nodes.
    abstract createNodeData(): C[];

    // Indicate that something external changed and we should recalculate nodeData.
    markNodeDataDirty() {
        this.nodeDataRefresh = true;
    }

    visibleChanged() {
        // Override point for this.visible change post-processing.
    }

    // Produce data joins and update selection's nodes using node data.
    abstract update(): void;

    protected getOpacity(datum?: { itemId?: any }): number {
        const {
            highlightStyle: {
                series: { dimOpacity = 1, enabled = true },
            },
        } = this;

        const defaultOpacity = 1;
        if (enabled === false || dimOpacity === defaultOpacity) {
            return defaultOpacity;
        }

        switch (this.isItemIdHighlighted(datum)) {
            case 'no-highlight':
            case 'highlighted':
                return defaultOpacity;
            case 'peer-highlighted':
            case 'other-highlighted':
                return dimOpacity;
        }
    }

    protected getStrokeWidth(defaultStrokeWidth: number, datum?: { itemId?: any }): number {
        const {
            highlightStyle: {
                series: { strokeWidth, enabled = true },
            },
        } = this;

        if (enabled === false || strokeWidth === undefined) {
            // No change in styling for highlight cases.
            return defaultStrokeWidth;
        }

        switch (this.isItemIdHighlighted(datum)) {
            case 'highlighted':
                return strokeWidth;
            case 'no-highlight':
            case 'other-highlighted':
            case 'peer-highlighted':
                return defaultStrokeWidth;
        }
    }

    protected getZIndex(datum?: { itemId?: any }): number {
        const defaultZIndex = Layers.SERIES_LAYER_ZINDEX;

        switch (this.isItemIdHighlighted(datum)) {
            case 'highlighted':
            case 'peer-highlighted':
                return Layers.SERIES_HIGHLIGHT_LAYER_ZINDEX - 2;
            case 'no-highlight':
            case 'other-highlighted':
                return defaultZIndex;
        }
    }

    protected isItemIdHighlighted(datum?: {
        itemId?: any;
    }): 'highlighted' | 'other-highlighted' | 'peer-highlighted' | 'no-highlight' {
        const {
            chart: {
                highlightedDatum: { series = undefined, itemId = undefined } = {},
                highlightedDatum = undefined,
            } = {},
        } = this;

        const highlighting = series != null;

        if (!highlighting) {
            // Highlighting not active.
            return 'no-highlight';
        }

        if (series !== this) {
            // Highlighting active, this series not highlighted.
            return 'other-highlighted';
        }

        if (itemId === undefined) {
            // Series doesn't use itemIds - so no further refinement needed, series is highlighted.
            return 'highlighted';
        }

        if (datum && highlightedDatum !== datum && itemId !== datum.itemId) {
            // Highlighting active, this series item not highlighted.
            return 'peer-highlighted';
        }

        return 'highlighted';
    }

    abstract getTooltipHtml(seriesDatum: any): string;

    pickNode(
        x: number,
        y: number,
        limitPickModes?: SeriesNodePickMode[]
    ): { pickMode: SeriesNodePickMode; match: SeriesNodeDatum; distance: number } | undefined {
        const { pickModes, visible, group } = this;

        if (!visible || !group.visible) {
            return;
        }

        for (const pickMode of pickModes) {
            if (limitPickModes && !limitPickModes.includes(pickMode)) {
                continue;
            }

            let match: SeriesNodePickMatch | undefined = undefined;

            switch (pickMode) {
                case SeriesNodePickMode.EXACT_SHAPE_MATCH:
                    match = this.pickNodeExactShape(x, y);
                    break;

                case SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST:
                case SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST:
                    match = this.pickNodeMainAxisFirst(
                        x,
                        y,
                        pickMode === SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST
                    );
                    break;

                case SeriesNodePickMode.NEAREST_NODE:
                    match = this.pickNodeClosestDatum(x, y);
                    break;
            }

            if (match) {
                return { pickMode, match: match.datum, distance: match.distance };
            }
        }
    }

    protected pickNodeExactShape(x: number, y: number): SeriesNodePickMatch | undefined {
        const match = this.pickGroup.pickNode(x, y);

        if (match) {
            return {
                datum: match.datum,
                distance: 0,
            };
        }
    }

    protected pickNodeClosestDatum(_x: number, _y: number): SeriesNodePickMatch | undefined {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeClosestDatum() not implemented');
    }

    protected pickNodeMainAxisFirst(
        _x: number,
        _y: number,
        _requireCategoryAxis: boolean
    ): SeriesNodePickMatch | undefined {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeMainAxisFirst() not implemented');
    }

    abstract getLabelData(): PointLabelDatum[];

    fireNodeClickEvent(_event: MouseEvent, _datum: C['nodeData'][number]): void {
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

    protected fixNumericExtent(extent?: [number | Date, number | Date], axis?: ChartAxis): number[] {
        if (extent === undefined) {
            // Don't return a range, there is no range.
            return [];
        }

        let [min, max] = extent;
        min = +min;
        max = +max;

        if (min === 0 && max === 0) {
            // domain has zero length and the single valid value is 0. Use the default of [0, 1].
            return [0, 1];
        }

        if (min === Infinity && max === -Infinity) {
            // There's no data in the domain.
            return [];
        }
        if (min === Infinity) {
            min = 0;
        }
        if (max === -Infinity) {
            max = 0;
        }

        if (min === max) {
            // domain has zero length, there is only a single valid value in data

            if (axis instanceof TimeAxis) {
                // numbers in domain correspond to Unix timestamps
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
            return [];
        }

        return [min, max];
    }
}
