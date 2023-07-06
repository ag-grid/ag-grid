import { Group } from '../../scene/group';
import type { ChartLegendDatum } from '../legendDatum';
import type { TypedEvent } from '../../util/observable';
import { Observable } from '../../util/observable';
import type { ChartAxis } from '../chartAxis';
import { createId } from '../../util/id';
import { checkDatum } from '../../util/value';
import {
    BOOLEAN,
    OPT_BOOLEAN,
    OPT_NUMBER,
    OPT_COLOR_STRING,
    INTERACTION_RANGE,
    STRING,
    Validate,
} from '../../util/validation';
import type { PlacedLabel, PointLabelDatum } from '../../util/labelPlacement';
import { Layers } from '../layers';
import type { SizedPoint, Point } from '../../scene/point';
import type { BBox } from '../../scene/bbox';
import { ChartAxisDirection } from '../chartAxisDirection';
import type { AgChartInteractionRange } from '../agChartOptions';
import type { DatumPropertyDefinition, ScopeProvider } from '../data/dataModel';
import { fixNumericExtent } from '../data/dataModel';
import { TooltipPosition } from '../tooltip/tooltip';
import { accumulatedValue, trailingAccumulatedValue } from '../data/aggregateFunctions';
import type { ModuleContext } from '../../util/moduleContext';
import type { DataController } from '../data/dataController';
import { accumulateGroup } from '../data/processors';
import { ActionOnSet } from '../../util/proxy';
import type { SeriesGrouping } from './seriesStateManager';
import type { ZIndexSubOrder } from '../../scene/node';

/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
    // For example, in `sectorNode.datum.seriesDatum`:
    // `sectorNode` - represents a pie sector
    // `datum` - contains metadata derived from the immutable series datum and used
    //           to set the properties of the node, such as start/end angles
    // `datum` - raw series datum, an element from the `series.data` array
    readonly series: Series<any>;
    readonly itemId?: any;
    readonly datum: any;
    readonly point?: Readonly<SizedPoint>;
    nodeMidPoint?: Readonly<Point>;
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

function basicContinuousCheckDatumValidation(v: any) {
    return checkDatum(v, true) != null;
}

function basicDiscreteCheckDatumValidation(v: any) {
    return checkDatum(v, false) != null;
}

export function keyProperty<K>(
    scope: ScopeProvider,
    propName: K,
    continuous: boolean,
    opts = {} as Partial<DatumPropertyDefinition<K>>
) {
    const result: DatumPropertyDefinition<K> = {
        scopes: [scope.id],
        property: propName,
        type: 'key',
        valueType: continuous ? 'range' : 'category',
        validation: continuous ? basicContinuousCheckDatumValidation : basicDiscreteCheckDatumValidation,
        ...opts,
    };
    return result;
}

export function valueProperty<K>(
    scope: ScopeProvider,
    propName: K,
    continuous: boolean,
    opts = {} as Partial<DatumPropertyDefinition<K>>
) {
    const result: DatumPropertyDefinition<K> = {
        scopes: [scope.id],
        property: propName,
        type: 'value',
        valueType: continuous ? 'range' : 'category',
        validation: continuous ? basicContinuousCheckDatumValidation : basicDiscreteCheckDatumValidation,
        ...opts,
    };
    return result;
}

export function rangedValueProperty<K>(
    scope: ScopeProvider,
    propName: K,
    opts = {} as Partial<DatumPropertyDefinition<K>> & { min?: number; max?: number }
): DatumPropertyDefinition<K> {
    const { min = -Infinity, max = Infinity, ...defOpts } = opts;
    return {
        scopes: [scope.id],
        type: 'value',
        property: propName,
        valueType: 'range',
        validation: basicContinuousCheckDatumValidation,
        processor: () => (datum) => {
            if (typeof datum !== 'number') return datum;
            if (isNaN(datum)) return datum;

            return Math.min(Math.max(datum, min), max);
        },
        ...defOpts,
    };
}

export function accumulativeValueProperty<K>(
    scope: ScopeProvider,
    propName: K,
    continuous: boolean,
    opts = {} as Partial<DatumPropertyDefinition<K>>
) {
    const result: DatumPropertyDefinition<K> = {
        ...valueProperty(scope, propName, continuous, opts),
        processor: accumulatedValue(),
    };
    return result;
}

export function trailingAccumulatedValueProperty<K>(
    scope: ScopeProvider,
    propName: K,
    continuous: boolean,
    opts = {} as Partial<DatumPropertyDefinition<K>>
) {
    const result: DatumPropertyDefinition<K> = {
        ...valueProperty(scope, propName, continuous, opts),
        processor: trailingAccumulatedValue(),
    };
    return result;
}

export function groupAccumulativeValueProperty<K>(
    scope: ScopeProvider,
    propName: K,
    continuous: boolean,
    mode: 'normal' | 'trailing' | 'window' | 'window-trailing',
    sum: 'current' | 'last' = 'current',
    opts: Partial<DatumPropertyDefinition<K>> & { groupId: string }
) {
    return [valueProperty(scope, propName, continuous, opts), accumulateGroup(scope, opts.groupId, mode, sum)];
}

export class SeriesNodeBaseClickEvent<Datum extends { datum: any }> implements TypedEvent {
    readonly type: 'nodeClick' | 'nodeDoubleClick' = 'nodeClick';
    readonly datum: any;
    readonly event: Event;
    readonly seriesId: string;

    constructor(nativeEvent: Event, datum: Datum, series: Series) {
        this.event = nativeEvent;
        this.datum = datum.datum;
        this.seriesId = series.id;
    }
}

export class SeriesNodeClickEvent<Datum extends { datum: any }> extends SeriesNodeBaseClickEvent<Datum> {}

export class SeriesNodeDoubleClickEvent<Datum extends { datum: any }> extends SeriesNodeBaseClickEvent<Datum> {
    readonly type = 'nodeDoubleClick';
}

export class SeriesItemHighlightStyle {
    @Validate(OPT_COLOR_STRING)
    fill?: string = 'yellow';

    @Validate(OPT_NUMBER(0, 1))
    fillOpacity?: number = undefined;

    @Validate(OPT_COLOR_STRING)
    stroke?: string = undefined;

    @Validate(OPT_NUMBER(0))
    strokeWidth?: number = undefined;
}

class SeriesHighlightStyle {
    @Validate(OPT_NUMBER(0))
    strokeWidth?: number = undefined;

    @Validate(OPT_NUMBER(0, 1))
    dimOpacity?: number = undefined;

    @Validate(OPT_BOOLEAN)
    enabled?: boolean = undefined;
}

class TextHighlightStyle {
    @Validate(OPT_COLOR_STRING)
    color?: string = 'black';
}

export class HighlightStyle {
    readonly item = new SeriesItemHighlightStyle();
    readonly series = new SeriesHighlightStyle();
    readonly text = new TextHighlightStyle();
}

export class SeriesTooltip {
    @Validate(BOOLEAN)
    enabled: boolean = true;

    @Validate(OPT_BOOLEAN)
    showArrow?: boolean = undefined;

    interaction?: SeriesTooltipInteraction = new SeriesTooltipInteraction();

    readonly position: TooltipPosition = new TooltipPosition();
}

export class SeriesTooltipInteraction {
    @Validate(BOOLEAN)
    enabled = false;
}

export type SeriesNodeDataContext<S = SeriesNodeDatum, L = S> = {
    itemId: string;
    nodeData: S[];
    labelData: L[];
};

export abstract class Series<C extends SeriesNodeDataContext = SeriesNodeDataContext> extends Observable {
    protected static readonly highlightedZIndex = 1000000000000;

    @Validate(STRING)
    readonly id = createId(this);

    get type(): string {
        return (this.constructor as any).type ?? '';
    }

    // The group node that contains all the nodes used to render this series.
    readonly rootGroup: Group = new Group({ name: 'seriesRoot', isVirtual: true });

    // The group node that contains the series rendering in it's default (non-highlighted) state.
    readonly contentGroup: Group;

    // The group node that contains all highlighted series items. This is a performance optimisation
    // for large-scale data-sets, where the only thing that routinely varies is the currently
    // highlighted node.
    readonly highlightGroup: Group;
    readonly highlightNode: Group;
    readonly highlightLabel: Group;

    // Lazily initialised labelGroup for label presentation.
    readonly labelGroup?: Group;

    // Package-level visibility, not meant to be set by the user.
    chart?: {
        mode: 'standalone' | 'integrated';
        debug: boolean;
        placeLabels(): Map<Series<any>, PlacedLabel[]>;
        getSeriesRect(): Readonly<BBox> | undefined;
    };

    axes: Record<ChartAxisDirection, ChartAxis | undefined> = {
        [ChartAxisDirection.X]: undefined,
        [ChartAxisDirection.Y]: undefined,
    };

    directions: ChartAxisDirection[] = [ChartAxisDirection.X, ChartAxisDirection.Y];
    private directionKeys: { [key in ChartAxisDirection]?: string[] };
    private directionNames: { [key in ChartAxisDirection]?: string[] };

    // Flag to determine if we should recalculate node data.
    protected nodeDataRefresh = true;

    abstract tooltip: SeriesTooltip;

    protected _data?: any[] = undefined;
    set data(input: any[] | undefined) {
        this._data = input;
        this.nodeDataRefresh = true;
    }
    get data() {
        return this._data;
    }

    hasData() {
        const { data } = this;
        return data && (!Array.isArray(data) || data.length > 0);
    }

    @Validate(BOOLEAN)
    protected _visible = true;
    set visible(value: boolean) {
        this._visible = value;
        this.visibleChanged();
    }
    get visible() {
        return this._visible;
    }

    @Validate(BOOLEAN)
    showInLegend = true;

    pickModes: SeriesNodePickMode[];

    @Validate(STRING)
    cursor = 'default';

    @Validate(INTERACTION_RANGE)
    nodeClickRange: AgChartInteractionRange = 'exact';

    @ActionOnSet<Series>({
        changeValue: function (newVal, oldVal) {
            this.onSeriesGroupingChange(oldVal, newVal);
        },
    })
    seriesGrouping?: SeriesGrouping = undefined;

    private onSeriesGroupingChange(prev?: SeriesGrouping, next?: SeriesGrouping) {
        const { id, type, visible, rootGroup, _declarationOrder } = this;

        if (prev) {
            this.ctx.seriesStateManager.deregisterSeries({ id, type });
        }
        if (next) {
            this.ctx.seriesStateManager.registerSeries({ id, type, visible, seriesGrouping: next });
        }
        this.ctx.seriesLayerManager.changeGroup({
            id,
            seriesGrouping: next,
            oldGrouping: prev,
            rootGroup,
            type,
            _declarationOrder,
            getGroupZIndexSubOrder: (type) => this.getGroupZIndexSubOrder(type),
        });
    }

    getBandScalePadding() {
        return { inner: 1, outer: 0 };
    }

    _declarationOrder: number = -1;

    protected readonly ctx: ModuleContext;

    constructor(seriesOpts: {
        moduleCtx: ModuleContext;
        useSeriesGroupLayer?: boolean;
        useLabelLayer?: boolean;
        pickModes?: SeriesNodePickMode[];
        contentGroupVirtual?: boolean;
        directionKeys?: { [key in ChartAxisDirection]?: string[] };
        directionNames?: { [key in ChartAxisDirection]?: string[] };
    }) {
        super();

        this.ctx = seriesOpts.moduleCtx;

        const {
            useLabelLayer = false,
            pickModes = [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST],
            directionKeys = {},
            directionNames = {},
            contentGroupVirtual = true,
        } = seriesOpts;

        const { rootGroup } = this;

        this.directionKeys = directionKeys;
        this.directionNames = directionNames;

        this.contentGroup = rootGroup.appendChild(
            new Group({
                name: `${this.id}-content`,
                layer: !contentGroupVirtual,
                isVirtual: contentGroupVirtual,
                zIndex: Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: this.getGroupZIndexSubOrder('data'),
            })
        );

        this.highlightGroup = rootGroup.appendChild(
            new Group({
                name: `${this.id}-highlight`,
                layer: true,
                zIndex: Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: this.getGroupZIndexSubOrder('highlight'),
            })
        );
        this.highlightNode = this.highlightGroup.appendChild(new Group({ name: 'highlightNode' }));
        this.highlightLabel = this.highlightGroup.appendChild(new Group({ name: 'highlightLabel' }));
        this.highlightNode.zIndex = 0;
        this.highlightLabel.zIndex = 10;

        this.pickModes = pickModes;

        if (useLabelLayer) {
            this.labelGroup = rootGroup.appendChild(
                new Group({
                    name: `${this.id}-series-labels`,
                    layer: true,
                    zIndex: Layers.SERIES_LABEL_ZINDEX,
                })
            );
        }
    }

    getGroupZIndexSubOrder(
        type: 'data' | 'labels' | 'highlight' | 'path' | 'marker' | 'paths',
        subIndex = 0
    ): ZIndexSubOrder {
        let mainAdjust = 0;
        switch (type) {
            case 'data':
            case 'paths':
                break;
            case 'labels':
                mainAdjust += 20000;
                break;
            case 'marker':
                mainAdjust += 10000;
                break;
            // Following cases are in their own layer, so need to be careful to respect declarationOrder.
            case 'highlight':
                subIndex += 15000;
                break;
        }
        const main = () => this._declarationOrder + mainAdjust;
        return [main, subIndex];
    }

    addChartEventListeners(): void {
        return;
    }

    destroy(): void {
        this.ctx.seriesStateManager.deregisterSeries(this);
        this.ctx.seriesLayerManager.releaseGroup(this);
    }

    private getDirectionValues(
        direction: ChartAxisDirection,
        properties: { [key in ChartAxisDirection]?: string[] }
    ): string[] {
        const resolvedDirection = this.resolveKeyDirection(direction);
        const keys = properties?.[resolvedDirection];
        const values: string[] = [];

        const flatten = (...array: any[]) => {
            for (const value of array) {
                addValue(value);
            }
        };

        const addValue = (value: any) => {
            if (Array.isArray(value)) {
                flatten(...value);
            } else if (typeof value === 'object') {
                flatten(Object.values(value));
            } else {
                values.push(value);
            }
        };

        if (!keys) return values;

        keys.forEach((key) => {
            const value = (this as any)[key];

            addValue(value);
        });

        return values;
    }

    getKeys(direction: ChartAxisDirection): string[] {
        return this.getDirectionValues(direction, this.directionKeys);
    }

    getNames(direction: ChartAxisDirection): (string | undefined)[] {
        return this.getDirectionValues(direction, this.directionNames);
    }

    protected resolveKeyDirection(direction: ChartAxisDirection): ChartAxisDirection {
        return direction;
    }

    abstract getDomain(direction: ChartAxisDirection): any[];

    // Fetch required values from the `chart.data` or `series.data` objects and process them.
    abstract processData(dataController: DataController): Promise<void>;

    // Using processed data, create data that backs visible nodes.
    abstract createNodeData(): Promise<C[]>;

    // Indicate that something external changed and we should recalculate nodeData.
    markNodeDataDirty() {
        this.nodeDataRefresh = true;
    }

    visibleChanged() {
        this.ctx.seriesStateManager.registerSeries(this);
    }

    // Produce data joins and update selection's nodes using node data.
    abstract update(opts: { seriesRect?: BBox }): Promise<void>;

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

    protected isItemIdHighlighted(datum?: {
        itemId?: any;
    }): 'highlighted' | 'other-highlighted' | 'peer-highlighted' | 'no-highlight' {
        const highlightedDatum = this.ctx.highlightManager?.getActiveHighlight();
        const { series, itemId } = highlightedDatum ?? {};
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
            // A peer (in same Series instance) sub-series has highlight active, but this sub-series
            // does not.
            return 'peer-highlighted';
        }

        return 'highlighted';
    }

    abstract getTooltipHtml(seriesDatum: any): string;

    pickNode(
        point: Point,
        limitPickModes?: SeriesNodePickMode[]
    ): { pickMode: SeriesNodePickMode; match: SeriesNodeDatum; distance: number } | undefined {
        const { pickModes, visible, rootGroup } = this;

        if (!visible || !rootGroup.visible) {
            return;
        }

        for (const pickMode of pickModes) {
            if (limitPickModes && !limitPickModes.includes(pickMode)) {
                continue;
            }

            let match: SeriesNodePickMatch | undefined = undefined;

            switch (pickMode) {
                case SeriesNodePickMode.EXACT_SHAPE_MATCH:
                    match = this.pickNodeExactShape(point);
                    break;

                case SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST:
                case SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST:
                    match = this.pickNodeMainAxisFirst(
                        point,
                        pickMode === SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST
                    );
                    break;

                case SeriesNodePickMode.NEAREST_NODE:
                    match = this.pickNodeClosestDatum(point);
                    break;
            }

            if (match) {
                return { pickMode, match: match.datum, distance: match.distance };
            }
        }
    }

    protected pickNodeExactShape(point: Point): SeriesNodePickMatch | undefined {
        const match = this.contentGroup.pickNode(point.x, point.y);

        if (match) {
            return {
                datum: match.datum,
                distance: 0,
            };
        }
    }

    protected pickNodeClosestDatum(_point: Point): SeriesNodePickMatch | undefined {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeClosestDatum() not implemented');
    }

    protected pickNodeMainAxisFirst(_point: Point, _requireCategoryAxis: boolean): SeriesNodePickMatch | undefined {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeMainAxisFirst() not implemented');
    }

    abstract getLabelData(): PointLabelDatum[];

    fireNodeClickEvent(event: Event, _datum: C['nodeData'][number]): void {
        const eventObject = this.getNodeClickEvent(event, _datum);
        this.fireEvent(eventObject);
    }

    fireNodeDoubleClickEvent(event: Event, _datum: C['nodeData'][number]): void {
        const eventObject = this.getNodeDoubleClickEvent(event, _datum);
        this.fireEvent(eventObject);
    }

    protected getNodeClickEvent(event: Event, datum: SeriesNodeDatum): SeriesNodeClickEvent<any> {
        return new SeriesNodeClickEvent(event, datum, this);
    }

    protected getNodeDoubleClickEvent(event: Event, datum: SeriesNodeDatum): SeriesNodeDoubleClickEvent<any> {
        return new SeriesNodeDoubleClickEvent(event, datum, this);
    }

    abstract getLegendData(): ChartLegendDatum[];

    protected toggleSeriesItem(_itemId: any, enabled: boolean): void {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    }

    isEnabled() {
        return this.visible;
    }

    readonly highlightStyle = new HighlightStyle();

    protected fixNumericExtent(extent?: [number | Date, number | Date], axis?: ChartAxis): number[] {
        const fixedExtent = fixNumericExtent(extent);

        if (fixedExtent.length === 0) {
            return fixedExtent;
        }

        let [min, max] = fixedExtent;
        if (min === max) {
            // domain has zero length, there is only a single valid value in data

            const [paddingMin, paddingMax] = axis?.calculatePadding(min, max) ?? [1, 1];
            min -= paddingMin;
            max += paddingMax;
        }

        return [min, max];
    }
}
