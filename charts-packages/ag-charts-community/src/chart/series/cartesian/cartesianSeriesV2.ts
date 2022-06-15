import { Series, SeriesNodeDatum } from "../series";
import { ChartAxis, ChartAxisDirection } from "../../chartAxis";
import { SeriesMarker, SeriesMarkerFormatterParams } from "../seriesMarker";
import { isContinuous, isDiscrete } from "../../../util/value";
import { Path } from "../../../scene/shape/path";
import { Selection } from "../../../scene/selection";
import { Marker } from "../../marker/marker";
import { Group } from "../../../scene/group";
import { Text } from "../../../scene/shape/text";
import { Node } from "../../../scene/node";

interface SubGroup<DatumType, LabelType, SceneNodeType extends Node> {
    mainPath: Path;
    group: Group;
    pickGroup: Group;
    datumSelection: Selection<SceneNodeType, Group, DatumType, any>;
    labelSelection: Selection<Text, Group, LabelType, any>;
}

type PickGroupInclude = 'mainPath' | 'datumNodes';
interface SeriesOpts {
    pickGroupIncludes: PickGroupInclude[];
}

export abstract class CartesianSeriesV2<
    S extends SeriesNodeDatum,
    L extends SeriesNodeDatum = S,
    N extends Node = Marker,
> extends Series<S, L, 'multi'> {
    private nodeData: S[][] = [];
    private flatNodeData?: S[] = [];
    private labelData: L[][] = [];
    private flatLabelData?: L[] = [];

    private highlightSelection: Selection<N, Group, S, any> = Selection.select(this.highlightGroup).selectAll<N>();

    private subGroups: SubGroup<S, L, any>[] = [];
    private subGroupId: number = 0;

    private readonly opts: SeriesOpts;

    protected constructor(opts: Partial<SeriesOpts> = {}) {
        super({ seriesGroupUsesLayer: false });

        const { pickGroupIncludes = ['datumNodes'] as PickGroupInclude[] } = opts;
        this.opts = { pickGroupIncludes };
    }

    directionKeys: { [key in ChartAxisDirection]?: string[] } = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKey']
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
            (isContinuousX && isContinuous(x) || !isContinuousX && isDiscrete(x)) &&
            (isContinuousY && isContinuous(y) || !isContinuousY && isDiscrete(y));
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

    getNodeData() {
        const { nodeData } = this;

        if (this.flatNodeData === undefined) {
            this.flatNodeData = nodeData.reduce((r, n) => r.concat(...n), []);
        }
        return this.flatNodeData;
    }

    getLabelData() {
        const { labelData } = this;

        if (this.flatLabelData === undefined) {
            this.flatLabelData = labelData.reduce((r, n) => r.concat(...n), []);
        }
        return this.flatLabelData;
    }

    update(): void {
        const { chart: { highlightedDatum: { datum = undefined, series = undefined } = {}, highlightedDatum = undefined } = {}} = this;
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

        this.nodeData = this.createNodeData();
        this.flatNodeData = undefined;
        this.labelData = this.createLabelData({ nodeData: this.nodeData });
        this.flatLabelData = undefined;
        this.updateSeriesGroups();

        const { nodeData } = this;

        this.subGroups.forEach((subGroup, idx) => {
            const { datumSelection, labelSelection, mainPath: path } = subGroup;
            const nodeData = this.nodeData[idx];
            const labelData = this.labelData[idx];
            this.updatePath({ seriesHighlighted, nodeData, path });
            subGroup.datumSelection = this.updateDatumSelection({ nodeData, datumSelection });
            subGroup.labelSelection = this.updateLabelSelection({ labelData, labelSelection });
        });
    }

    private updateSeriesGroups() {
        const { nodeData, subGroups, opts: { pickGroupIncludes } } = this;
        if (nodeData.length === subGroups.length) {
            return;
        }

        if (nodeData.length < subGroups.length) {
            subGroups.splice(nodeData.length)
                .forEach((group) => this.seriesGroup.removeChild(group.group));
        }

        while (nodeData.length > subGroups.length) {
            const group = new Group({
                name: `${this.id}-series-sub${this.subGroupId++}`,
                layer: true,
                zIndex: Series.SERIES_LAYER_ZINDEX,
            });
            this.seriesGroup.appendChild(group);
            const pickGroup = new Group();

            const mainPath = new Path();
            const pathParentGroup = pickGroupIncludes.includes('mainPath') ? pickGroup : group;
            pathParentGroup.appendChild(mainPath);

            group.appendChild(pickGroup);

            const datumParentGroup = pickGroupIncludes.includes('datumNodes') ? pickGroup : group;
            subGroups.push({
                mainPath,
                group,
                pickGroup,
                labelSelection: Selection.select(group).selectAll<Text>(),
                datumSelection: Selection.select(datumParentGroup).selectAll<N>(),
            });
        }
    }

    protected updateNodes(seriesHighlighted?: boolean) {
        const { highlightSelection } = this;

        this.group.visible = this.visible;
        this.seriesGroup.visible = this.visible;
        this.highlightGroup.visible = this.visible && !!seriesHighlighted;
        this.seriesGroup.opacity = this.getOpacity();

        this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true });
        
        this.subGroups.forEach((subGroup) => {
            const { group, datumSelection, labelSelection, mainPath: path } = subGroup;
            group.opacity = this.getOpacity(datumSelection.data[0]);
            group.visible = this.visible;

            this.updatePathNode({ seriesHighlighted, path });
            this.updateDatumNodes({ datumSelection: datumSelection, isHighlight: false });
            this.updateLabelNodes({ labelSelection: labelSelection });
        });
    }

    protected updateHighlightSelection(seriesHighlighted?: boolean) {
        const {
            chart: { highlightedDatum: { datum = undefined } = {}, highlightedDatum = undefined } = {},
            highlightSelection,
        } = this;

        const item = seriesHighlighted && highlightedDatum && datum ? highlightedDatum as S : undefined;
        this.highlightSelection = this.updateHighlightSelectionItem({ item, highlightSelection });
    }

    pickNode(x: number, y: number): Node | undefined {
        let result = super.pickNode(x, y);

        if (!result) {
            for (const { pickGroup } of this.subGroups ) {
                result = pickGroup.pickNode(x, y);

                if (result) {
                    break;
                }
            }
        }

        return result;
    }

    protected abstract createLabelData(opts: { nodeData: S[][] }): L[][];

    protected updatePath(opts: {seriesHighlighted?: boolean, nodeData: S[], path: Path}): void {
        // Override point for sub-classes.
        opts.path.visible = false;
    }

    protected updatePathNode(opts: {seriesHighlighted?: boolean, path: Path}): void {
        // Override point for sub-classes.
    }

    protected abstract updateHighlightSelectionItem(opts: { item?: S, highlightSelection: Selection<N, Group, S, any> }): Selection<N, Group, S, any>;

    protected abstract updateDatumSelection(opts: { nodeData: S[], datumSelection: Selection<N, Group, S, any> }): Selection<N, Group, S, any>;
    protected abstract updateDatumNodes(opts: { datumSelection: Selection<N, Group, S, any>, isHighlight: boolean }): void;

    protected abstract updateLabelSelection(opts: { labelData: L[], labelSelection: Selection<Text, Group, L, any>  }): Selection<Text, Group, L, any>;
    protected abstract updateLabelNodes(opts: { labelSelection: Selection<Text, Group, L, any>  }): void;
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
