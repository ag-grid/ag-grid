import { Series, SeriesNodeDatum } from "../series";
import { ChartAxis, ChartAxisDirection } from "../../chartAxis";
import { SeriesMarker, SeriesMarkerFormatterParams } from "../seriesMarker";
import { isContinuous, isDiscrete } from "../../../util/value";
import { Path } from "../../../scene/shape/path";
import { Selection } from "../../../scene/selection";
import { Marker } from "../../marker/marker";
import { Group } from "../../../scene/group";
import { Text } from "../../../scene/shape/text";

export abstract class CartesianSeriesV2<S extends SeriesNodeDatum> extends Series<S> {
    private nodeData: S[] = [];

    private mainPath = new Path();
    private markerSelection: Selection<Marker, Group, S, any> = Selection.select(this.seriesGroup).selectAll<Marker>();
    private labelSelection: Selection<Text, Group, S, any> = Selection.select(this.seriesGroup).selectAll<Text>();
    private highlightSelection: Selection<Marker, Group, S, any> = Selection.select(this.highlightGroup).selectAll<Marker>();

    protected constructor() {
        super();

        // Make line render before markers in the pick group.
        this.seriesGroup.insertBefore(this.mainPath, this.pickGroup);
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
        return this.nodeData;
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

        const {
            nodeData,
            mainPath: path,
            markerSelection,
            labelSelection,
        } = this;

        this.updatePath({ seriesHighlighted, nodeData, path });
        this.markerSelection = this.updateMarkerSelection({ nodeData, markerSelection });
        this.labelSelection = this.updateLabelSelection({ nodeData, labelSelection });
    }

    protected updateNodes(seriesHighlighted?: boolean) {
        const {
            markerSelection,
            highlightSelection,
            labelSelection,
            mainPath: path,
        } = this;

        this.group.visible = this.visible;
        this.seriesGroup.visible = this.visible;
        this.highlightGroup.visible = this.visible && !!seriesHighlighted;
        this.seriesGroup.opacity = this.getOpacity();

        this.updatePathNode({ seriesHighlighted, path });
        this.updateMarkerNodes({ markerSelection, isHighlight: false });
        this.updateMarkerNodes({ markerSelection: highlightSelection, isHighlight: true });
        this.updateLabelNodes({ labelSelection });
    }

    protected updateHighlightSelection(seriesHighlighted?: boolean) {
        const {
            chart: { highlightedDatum: { datum = undefined } = {}, highlightedDatum = undefined } = {},
            highlightSelection,
        } = this;

        const item = seriesHighlighted && highlightedDatum && datum ? highlightedDatum as S : undefined;
        this.highlightSelection = this.updateHighlightSelectionItem({ item, highlightSelection });
    }

    protected abstract updatePath(opts: {seriesHighlighted?: boolean, nodeData: S[], path: Path}): void;
    protected abstract updatePathNode(opts: {seriesHighlighted?: boolean, path: Path}): void;
    protected abstract updateHighlightSelectionItem(opts: { item?: S, highlightSelection: Selection<Marker, Group, S, any> }): Selection<Marker, Group, S, any>;
    protected abstract updateMarkerSelection(opts: { nodeData: S[], markerSelection: Selection<Marker, Group, S, any> }): Selection<Marker, Group, S, any>;
    protected abstract updateMarkerNodes(opts: { markerSelection: Selection<Marker, Group, S, any>, isHighlight: boolean }): void;
    protected abstract updateLabelSelection(opts: { nodeData: S[], labelSelection: Selection<Text, Group, S, any>  }): Selection<Text, Group, S, any>;
    protected abstract updateLabelNodes(opts: { labelSelection: Selection<Text, Group, S, any>  }): void;
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
