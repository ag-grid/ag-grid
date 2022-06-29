import { PointerEvents } from "../../scene/node";
import { Group } from "../../scene/group";
import { Path } from "../../scene/shape/path";
import { FontStyle, FontWeight } from "../../scene/shape/text";
import { Scale } from "../../scale/scale";
import { createId } from "../../util/id";
import { Series } from "../series/series";
import { ChartAxisDirection } from "../chartAxis";

export class CrossLineLabel {
    text?: string = undefined;
    fontStyle?: FontStyle = undefined;
    fontWeight?: FontWeight = undefined;
    fontSize: number = 15;
    fontFamily: string = 'Verdana, sans-serif';
    /**
     * The padding between the label and the line.
     */
    padding: number = 5;
    /**
     * The color of the labels.
     */
    color?: string = 'rgba(87, 87, 87, 1)';
    position?: CrossLineLabelPosition = undefined;
    rotation?: number = undefined;
    parallel?: boolean = undefined;
}

export type CrossLineLabelPosition =
    'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'inside'
    | 'insideLeft'
    | 'insideRight'
    | 'insideTop'
    | 'insideBottom'
    | 'insideTopLeft'
    | 'insideBottomLeft'
    | 'insideTopRight'
    | 'insideBottomRight';

export interface Point {
    readonly x: number;
    readonly y: number;
}

interface CrossLinePathData {
    readonly points: Point[];
}

export class CrossLine {

    protected static readonly ANNOTATION_LAYER_ZINDEX = Series.SERIES_LAYER_ZINDEX + 20;

    static className = "CrossLine";
    readonly id = createId(this);

    kind?: "line" | "range" = undefined;
    range?: [any, any] = undefined;
    value?: any = undefined;
    label: CrossLineLabel = new CrossLineLabel();

    scale?: Scale<any, number> = undefined;
    gridLength: number = 0;
    sideFlag: 1 | -1 = -1;
    direction: ChartAxisDirection = ChartAxisDirection.X;

    readonly group = new Group({ name: `${this.id}`, layer: true, zIndex: CrossLine.ANNOTATION_LAYER_ZINDEX });
    private crossLineLine: Path = new Path();
    private crossLineRange: Path = new Path();
    private pathData?: CrossLinePathData = undefined;

    constructor() {
        const { group, crossLineLine, crossLineRange } = this;

        group.append([crossLineRange, crossLineLine ]);

        crossLineLine.fill = undefined;
        crossLineLine.pointerEvents = PointerEvents.None;

        crossLineRange.pointerEvents = PointerEvents.None;
    }

    update(visible: boolean) {
        if (!this.kind) { return; }

        this.group.visible = visible;

        if (!visible) { return; }

        this.createNodeData();
        this.updatePaths();
    }

    private updatePaths() {
        this.updateLinePath();
        this.updateLineNode();

        if (this.kind === 'range') {
            this.updateRangePath();
            this.updateRangeNode();
        }
    }

    private createNodeData() {
        const { scale, gridLength, sideFlag, range, value } = this;

        if (!scale) { return; }

        const halfBandwidth = (scale.bandwidth || 0) / 2;

        let xStart, xEnd, yStart, yEnd;
        this.pathData = { points: [] };

        [xStart, xEnd] = [0, sideFlag * gridLength];
        [yStart, yEnd] = range ? [Math.min(...range), Math.max(...range)] : [value, undefined];
        [yStart, yEnd] = [scale.convert(yStart) + halfBandwidth, scale.convert(yEnd) + halfBandwidth];

        this.pathData.points.push(
            {
                x: xStart,
                y: yStart
            },
            {
                x: xEnd,
                y: yStart
            },
            {
                x: xEnd,
                y: yEnd
            },
            {
                x: xStart,
                y: yEnd
            }
        );
    }

    private updateLinePath() {
        const { crossLineLine, pathData = { points: [] } } = this;
        const pathMethods: ('moveTo' | 'lineTo')[] = ['moveTo', 'lineTo', 'moveTo', 'lineTo'];
        const points = pathData.points;
        const { path } = crossLineLine;

        path.clear({ trackChanges: true });
        pathMethods.forEach((method, i) => {
            const { x, y } = points[i];
            path[method](x, y);
        })
        path.closePath();
        crossLineLine.checkPathDirty();
    }

    private updateLineNode() {
    }

    private updateRangeNode() {
    }

    private updateRangePath() {
        const { crossLineRange, pathData = { points: [] } } = this;
        const points = pathData.points;
        const { path } = crossLineRange;

        path.clear({ trackChanges: true });
        points.forEach((point, i) => {
            const { x, y } = point;
            path[i > 0 ? 'lineTo' : 'moveTo'](x, y);
        });
        path.closePath();
        crossLineRange.checkPathDirty();
    }
}