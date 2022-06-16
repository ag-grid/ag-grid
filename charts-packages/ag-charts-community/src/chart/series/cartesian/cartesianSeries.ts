import { Series, SeriesNodeDataContext } from '../series';
import { ChartAxis, ChartAxisDirection } from '../../chartAxis';
import { SeriesMarker, SeriesMarkerFormatterParams } from '../seriesMarker';
import { isContinuous, isDiscrete } from '../../../util/value';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Marker } from '../../marker/marker';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Node } from '../../../scene/node';

type NodeDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<
    N,
    Group,
    ContextType['nodeData'][number],
    any
>;
type LabelDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<
    N,
    Group,
    ContextType['labelData'][number],
    any
>;

interface SubGroup<C extends SeriesNodeDataContext, SceneNodeType extends Node> {
    paths: Path[];
    group: Group;
    pickGroup: Group;
    datumSelection: NodeDataSelection<SceneNodeType, C>;
    labelSelection: LabelDataSelection<Text, C>;
}

type PickGroupInclude = 'mainPath' | 'datumNodes';
interface SeriesOpts {
    pickGroupIncludes: PickGroupInclude[];
    pathsPerSeries: number;
}

export abstract class CartesianSeries<
    C extends SeriesNodeDataContext<any, any>,
    N extends Node = Marker
> extends Series<C> {
    private contextNodeData: C[];

    private highlightSelection: NodeDataSelection<N, C> = Selection.select(this.highlightGroup).selectAll<N>();

    private subGroups: SubGroup<C, any>[] = [];
    private subGroupId: number = 0;

    private readonly opts: SeriesOpts;

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    protected readonly seriesItemEnabled = new Map<string, boolean>();

    protected constructor(opts: Partial<SeriesOpts> = {}) {
        super({ seriesGroupUsesLayer: false });

        const { pickGroupIncludes = ['datumNodes'] as PickGroupInclude[], pathsPerSeries = 1 } = opts;
        this.opts = { pickGroupIncludes, pathsPerSeries };
    }

    directionKeys: { [key in ChartAxisDirection]?: string[] } = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKey'],
    };

    /**
     * Note: we are passing `isContinuousX` and `isContinuousY` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param x A domain value to be plotted along the x-axis.
     * @param y A domain value to be plotted along the y-axis.
     * @param isContinuousX Typically this will be the value of `xAxis.scale instanceof ContinuousScale`.
     * @param isContinuousY Typically this will be the value of `yAxis.scale instanceof ContinuousScale`.
     * @returns `[x, y]`, if both x and y are valid domain values for their respective axes/scales, or `undefined`.
     */
    protected checkDomainXY<T, K>(x: T, y: K, isContinuousX: boolean, isContinuousY: boolean): [T, K] | undefined {
        const isValidDatum =
            ((isContinuousX && isContinuous(x)) || (!isContinuousX && isDiscrete(x))) &&
            ((isContinuousY && isContinuous(y)) || (!isContinuousY && isDiscrete(y)));
        return isValidDatum ? [x, y] : undefined;
    }

    /**
     * Note: we are passing `isContinuousScale` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param value A domain value to be plotted along an axis.
     * @param isContinuousScale Typically this will be the value of `xAxis.scale instanceof ContinuousScale` or `yAxis.scale instanceof ContinuousScale`.
     * @returns `value`, if the value is valid for its axis/scale, or `undefined`.
     */
    protected checkDatum<T>(value: T, isContinuousScale: boolean): T | string | undefined {
        if (isContinuousScale && isContinuous(value)) {
            return value;
        } else if (!isContinuousScale) {
            if (!isDiscrete(value)) {
                return String(value);
            }
            return value;
        }
        return undefined;
    }

    /**
     * Note: we are passing the xAxis and yAxis because the calling code is supposed to make sure
     *       that series has both of them defined, and also to avoid one level of indirection,
     *       e.g. `this.xAxis!.inRange(x)`, both of which are suboptimal in tight loops where this method is used.
     * @param x A range value to be plotted along the x-axis.
     * @param y A range value to be plotted along the y-axis.
     * @param xAxis The series' x-axis.
     * @param yAxis The series' y-axis.
     * @returns
     */
    protected checkRangeXY(x: number, y: number, xAxis: ChartAxis, yAxis: ChartAxis): boolean {
        return !isNaN(x) && !isNaN(y) && xAxis.inRange(x) && yAxis.inRange(y);
    }

    update(): void {
        const { chart: { highlightedDatum: { series = undefined } = {} } = {} } = this;
        const seriesHighlighted = series ? series === this : undefined;

        this.updateSelections(seriesHighlighted);
        this.updateNodes(seriesHighlighted);
    }

    protected updateSelections(seriesHighlighted?: boolean) {
        this.updateHighlightSelection(seriesHighlighted);

        if (!this.nodeDataRefresh) {
            return;
        }
        this.nodeDataRefresh = false;

        this.contextNodeData = this.createNodeData();
        this.updateSeriesGroups();

        this.subGroups.forEach((subGroup, seriesIdx) => {
            const { datumSelection, labelSelection, paths } = subGroup;
            const contextData = this.contextNodeData[seriesIdx];
            const { nodeData, labelData, itemId } = contextData;

            this.updatePaths({ seriesHighlighted, itemId, contextData, paths, seriesIdx });
            subGroup.datumSelection = this.updateDatumSelection({ nodeData, datumSelection, seriesIdx });
            subGroup.labelSelection = this.updateLabelSelection({ labelData, labelSelection, seriesIdx });
        });
    }

    private updateSeriesGroups() {
        const {
            contextNodeData,
            subGroups,
            opts: { pickGroupIncludes, pathsPerSeries },
        } = this;
        if (contextNodeData.length === subGroups.length) {
            return;
        }

        if (contextNodeData.length < subGroups.length) {
            subGroups.splice(contextNodeData.length).forEach((group) => this.seriesGroup.removeChild(group.group));
        }

        while (contextNodeData.length > subGroups.length) {
            const group = new Group({
                name: `${this.id}-series-sub${this.subGroupId++}`,
                layer: true,
                zIndex: Series.SERIES_LAYER_ZINDEX,
            });
            this.seriesGroup.appendChild(group);
            const pickGroup = new Group();

            const paths: Path[] = [];
            const pathParentGroup = pickGroupIncludes.includes('mainPath') ? pickGroup : group;
            for (let index = 0; index < pathsPerSeries; index++) {
                paths[index] = new Path();
                pathParentGroup.appendChild(paths[index]);
            }
            group.appendChild(pickGroup);

            const datumParentGroup = pickGroupIncludes.includes('datumNodes') ? pickGroup : group;
            subGroups.push({
                paths,
                group,
                pickGroup,
                labelSelection: Selection.select(group).selectAll<Text>(),
                datumSelection: Selection.select(datumParentGroup).selectAll<N>(),
            });
        }
    }

    protected updateNodes(seriesHighlighted?: boolean) {
        const { highlightSelection, contextNodeData } = this;

        const visible = this.visible && this.contextNodeData.length > 0;
        this.group.visible = visible;
        this.seriesGroup.visible = visible;
        this.highlightGroup.visible = visible && !!seriesHighlighted;
        this.seriesGroup.opacity = this.getOpacity();

        this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true, seriesIdx: -1 });

        this.subGroups.forEach((subGroup, seriesIdx) => {
            const { group, datumSelection, labelSelection, paths } = subGroup;
            const { itemId } = contextNodeData[seriesIdx];
            group.opacity = this.getOpacity({ itemId });
            group.visible = visible && (this.seriesItemEnabled.get(itemId) ?? true);

            this.updatePathNodes({ seriesHighlighted, itemId, paths, seriesIdx });
            this.updateDatumNodes({ datumSelection: datumSelection, isHighlight: false, seriesIdx });
            this.updateLabelNodes({ labelSelection: labelSelection, seriesIdx });
        });
    }

    protected updateHighlightSelection(seriesHighlighted?: boolean) {
        const {
            chart: { highlightedDatum: { datum = undefined } = {}, highlightedDatum = undefined } = {},
            highlightSelection,
        } = this;

        const item =
            seriesHighlighted && highlightedDatum && datum ? (highlightedDatum as C['nodeData'][number]) : undefined;
        this.highlightSelection = this.updateHighlightSelectionItem({ item, highlightSelection });
    }

    pickNode(x: number, y: number): Node | undefined {
        let result = super.pickNode(x, y);

        if (!result) {
            for (const { pickGroup } of this.subGroups) {
                result = pickGroup.pickNode(x, y);

                if (result) {
                    break;
                }
            }
        }

        return result;
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        if (this.seriesItemEnabled.size > 0) {
            this.seriesItemEnabled.set(itemId, enabled);
            this.nodeDataRefresh = true;
        } else {
            super.toggleSeriesItem(itemId, enabled);
        }
    }

    protected updatePaths(opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        contextData: C;
        paths: Path[];
        seriesIdx: number;
    }): void {
        // Override point for sub-classes.
        opts.paths.forEach((p) => (p.visible = false));
    }

    protected updatePathNodes(_opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        paths: Path[];
        seriesIdx: number;
    }): void {
        // Override point for sub-classes.
    }

    protected updateHighlightSelectionItem(opts: {
        item?: C['nodeData'][number];
        highlightSelection: NodeDataSelection<N, C>;
    }): NodeDataSelection<N, C> {
        const { item, highlightSelection: datumSelection } = opts;
        const nodeData = item ? [item] : [];

        return this.updateDatumSelection({ nodeData, datumSelection, seriesIdx: -1 });
    }

    protected abstract updateDatumSelection(opts: {
        nodeData: C['nodeData'];
        datumSelection: NodeDataSelection<N, C>;
        seriesIdx: number;
    }): NodeDataSelection<N, C>;
    protected abstract updateDatumNodes(opts: {
        datumSelection: NodeDataSelection<N, C>;
        isHighlight: boolean;
        seriesIdx: number;
    }): void;

    protected abstract updateLabelSelection(opts: {
        labelData: C['labelData'];
        labelSelection: LabelDataSelection<Text, C>;
        seriesIdx: number;
    }): LabelDataSelection<Text, C>;
    protected abstract updateLabelNodes(opts: { labelSelection: LabelDataSelection<Text, C>; seriesIdx: number }): void;
}

export interface CartesianSeriesMarkerFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    size?: number;
}

export class CartesianSeriesMarker extends SeriesMarker {
    formatter?: (params: CartesianSeriesMarkerFormatterParams) => CartesianSeriesMarkerFormat = undefined;
}

export interface CartesianSeriesMarkerFormatterParams extends SeriesMarkerFormatterParams {
    xKey: string;
    yKey: string;
}
