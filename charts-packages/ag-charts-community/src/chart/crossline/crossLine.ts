import { PointerEvents } from '../../scene/node';
import { Group } from '../../scene/group';
import { Path } from '../../scene/shape/path';
import { Text, FontStyle, FontWeight } from '../../scene/shape/text';
import { BBox } from '../../scene/bbox';
import { Scale } from '../../scale/scale';
import { clamper, ContinuousScale } from '../../scale/continuousScale';
import { createId } from '../../util/id';
import { Series } from '../series/series';
import { normalizeAngle360, toRadians } from '../../util/angle';
import { ChartAxisDirection, ChartAxisPosition } from '../chartAxis';
import {
    CrossLineLabelPosition,
    Point,
    labeldDirectionHandling,
    POSITION_TOP_COORDINATES,
    calculateLabelTranslation,
} from './crossLineLabelPosition';
import { checkDatum } from '../../util/value';

export class CrossLineLabel {
    enabled?: boolean = undefined;
    text?: string = undefined;
    fontStyle?: FontStyle = undefined;
    fontWeight?: FontWeight = undefined;
    fontSize: number = 14;
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

interface CrossLinePathData {
    readonly points: Point[];
}

type CrossLineType = 'line' | 'range';

export class CrossLine {
    protected static readonly LINE_LAYER_ZINDEX = Series.SERIES_CROSSLINE_LINE_ZINDEX;
    protected static readonly RANGE_LAYER_ZINDEX = Series.SERIES_CROSSLINE_RANGE_ZINDEX;

    static className = 'CrossLine';
    readonly id = createId(this);

    enabled?: boolean = undefined;
    type?: CrossLineType = undefined;
    range?: [any, any] = undefined;
    value?: any = undefined;
    fill?: string = undefined;
    fillOpacity?: number = undefined;
    stroke?: string = undefined;
    strokeWidth?: number = undefined;
    strokeOpacity?: number = undefined;
    lineDash?: [] = undefined;
    label: CrossLineLabel = new CrossLineLabel();

    scale?: Scale<any, number> = undefined;
    gridLength: number = 0;
    sideFlag: 1 | -1 = -1;
    parallelFlipRotation: number = 0;
    regularFlipRotation: number = 0;
    direction: ChartAxisDirection = ChartAxisDirection.X;

    readonly group = new Group({ name: `${this.id}`, layer: true, zIndex: CrossLine.LINE_LAYER_ZINDEX });
    private crossLineLabel = new Text();
    private crossLineLine: Path = new Path();
    private crossLineRange: Path = new Path();
    private labelPoint?: Point = undefined;
    private fillData?: CrossLinePathData = undefined;
    private strokeData?: CrossLinePathData = undefined;

    constructor() {
        const { group, crossLineLine, crossLineRange, crossLineLabel } = this;

        group.append([crossLineRange, crossLineLine, crossLineLabel]);

        crossLineLine.fill = undefined;
        crossLineLine.pointerEvents = PointerEvents.None;

        crossLineRange.pointerEvents = PointerEvents.None;
    }

    protected getZIndex(type: CrossLineType = 'line'): number {
        if (type === 'range') {
            return CrossLine.RANGE_LAYER_ZINDEX;
        }

        return CrossLine.LINE_LAYER_ZINDEX;
    }

    update(visible: boolean) {
        if (!this.enabled || !this.type) {
            return;
        }

        this.group.visible = visible;

        if (!visible) {
            return;
        }

        this.group.zIndex = this.getZIndex(this.type);

        const dataCreated = this.createNodeData();

        if (!dataCreated) {
            this.group.visible = false;
            return;
        }

        this.updatePaths();
    }

    private updatePaths() {
        this.updateLinePath();
        this.updateLineNode();

        if (this.type === 'range') {
            this.updateRangePath();
            this.updateRangeNode();
        }

        if (this.label.enabled) {
            this.updateLabel();
            this.positionLabel();
        }
    }

    private createNodeData(): boolean {
        const {
            scale,
            gridLength,
            sideFlag,
            direction,
            label: { position = 'top' },
        } = this;

        if (!scale) {
            return false;
        }

        const isContinuous = scale instanceof ContinuousScale;
        const bandwidth = scale.bandwidth ?? 0;

        let xStart, xEnd, yStart, yEnd, clampedYStart, clampedYEnd;
        this.fillData = { points: [] };
        this.strokeData = { points: [] };

        [xStart, xEnd] = [0, sideFlag * gridLength];
        [yStart, yEnd] = this.getRange();

        let isLine = false;
        if (yStart === undefined) {
            return false;
        } else if (yEnd === undefined) {
            isLine = true;
        }

        [clampedYStart, clampedYEnd] = [
            Number(scale.convert(yStart, isContinuous ? clamper : undefined)),
            scale.convert(yEnd, isContinuous ? clamper : undefined) + bandwidth,
        ];
        [yStart, yEnd] = [Number(scale.convert(yStart)), scale.convert(yEnd) + bandwidth];

        const isValidLine = yStart === clampedYStart;
        const isValidRange = yStart === clampedYStart || yEnd === clampedYEnd || clampedYStart !== clampedYEnd;

        if ((isLine && !isValidLine) || (!isLine && !isValidRange)) {
            return false;
        }

        this.strokeData.points.push(
            {
                x: xStart,
                y: yStart,
            },
            {
                x: xEnd,
                y: yStart,
            },
            {
                x: xEnd,
                y: yEnd,
            },
            {
                x: xStart,
                y: yEnd,
            }
        );

        this.fillData.points.push(
            {
                x: xStart,
                y: clampedYStart,
            },
            {
                x: xEnd,
                y: clampedYStart,
            },
            {
                x: xEnd,
                y: clampedYEnd,
            },
            {
                x: xStart,
                y: clampedYEnd,
            }
        );

        if (this.label.enabled) {
            const yDirection = direction === ChartAxisDirection.Y;

            const { c = POSITION_TOP_COORDINATES } = labeldDirectionHandling[position] ?? {};
            const { x: labelX, y: labelY } = c({ yDirection, xStart, xEnd, yStart: clampedYStart, yEnd: clampedYEnd });

            this.labelPoint = {
                x: labelX,
                y: labelY,
            };
        }

        return true;
    }

    private updateLinePath() {
        const { crossLineLine, strokeData = { points: [] } } = this;
        const pathMethods: ('moveTo' | 'lineTo')[] = ['moveTo', 'lineTo', 'moveTo', 'lineTo'];
        const points = strokeData.points;
        const { path } = crossLineLine;

        path.clear({ trackChanges: true });
        pathMethods.forEach((method, i) => {
            const { x, y } = points[i];
            path[method](x, y);
        });
        crossLineLine.checkPathDirty();
    }

    private updateLineNode() {
        const { crossLineLine, stroke, strokeWidth, lineDash } = this;
        crossLineLine.stroke = stroke;
        crossLineLine.strokeWidth = strokeWidth ?? 1;
        crossLineLine.opacity = this.strokeOpacity ?? 1;
        crossLineLine.lineDash = lineDash;
    }

    private updateRangeNode() {
        const { crossLineRange, fill, fillOpacity } = this;
        crossLineRange.fill = fill;
        crossLineRange.opacity = fillOpacity ?? 1;
    }

    private updateRangePath() {
        const { crossLineRange, fillData = { points: [] } } = this;
        const points = fillData.points;
        const { path } = crossLineRange;

        path.clear({ trackChanges: true });
        points.forEach((point, i) => {
            const { x, y } = point;
            path[i > 0 ? 'lineTo' : 'moveTo'](x, y);
        });
        path.closePath();
        crossLineRange.checkPathDirty();
    }

    private updateLabel() {
        const { crossLineLabel, label } = this;

        if (!label.text) {
            return;
        }

        crossLineLabel.fontStyle = label.fontStyle;
        crossLineLabel.fontWeight = label.fontWeight;
        crossLineLabel.fontSize = label.fontSize;
        crossLineLabel.fontFamily = label.fontFamily;
        crossLineLabel.fill = label.color;
        crossLineLabel.text = label.text;
    }

    private positionLabel() {
        const {
            crossLineLabel,
            labelPoint: { x = undefined, y = undefined } = {},
            label: { parallel, rotation, position = 'top', padding = 0 },
            direction,
            parallelFlipRotation,
            regularFlipRotation,
        } = this;

        if (x === undefined || y === undefined) {
            return;
        }

        const labelRotation = rotation ? normalizeAngle360(toRadians(rotation)) : 0;

        const parallelFlipFlag =
            !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        const regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;

        const autoRotation = parallel ? (parallelFlipFlag * Math.PI) / 2 : regularFlipFlag === -1 ? Math.PI : 0;

        crossLineLabel.rotation = autoRotation + labelRotation;

        crossLineLabel.textBaseline = 'middle';
        crossLineLabel.textAlign = 'center';

        const bbox = this.computeLabelBBox();

        if (!bbox) {
            return;
        }

        const yDirection = direction === ChartAxisDirection.Y;
        const { xTranslation, yTranslation } = calculateLabelTranslation({ yDirection, padding, position, bbox });

        crossLineLabel.translationX = x + xTranslation;
        crossLineLabel.translationY = y + yTranslation;
    }

    private getRange(): [any, any] {
        const { value, range, scale } = this;

        const isContinuous = scale instanceof ContinuousScale;

        let [start, end] = range ?? [value, undefined];

        if (!isContinuous && end === undefined) {
            end = start;
        }

        [start, end] = [checkDatum(start, isContinuous), checkDatum(end, isContinuous)];

        if (isContinuous && start === end) {
            end = undefined;
        }

        if (start === undefined && end !== undefined) {
            start = end;
            end = undefined;
        }

        return [start, end];
    }

    private computeLabelBBox(): BBox | undefined {
        return this.crossLineLabel.computeTransformedBBox();
    }

    calculatePadding(padding: Partial<Record<ChartAxisPosition, number>>, seriesRect: BBox) {
        const crossLineLabelBBox = this.computeLabelBBox();

        const labelX = crossLineLabelBBox?.x;
        const labelY = crossLineLabelBBox?.y;

        if (labelX == undefined || labelY == undefined) {
            return;
        }

        const labelWidth = crossLineLabelBBox?.width ?? 0;
        const labelHeight = crossLineLabelBBox?.height ?? 0;

        if (labelX + labelWidth >= seriesRect.x + seriesRect.width) {
            const paddingRight = labelX + labelWidth - (seriesRect.x + seriesRect.width);
            padding.right = (padding.right ?? 0) >= paddingRight ? padding.right : paddingRight;
        } else if (labelX <= seriesRect.x) {
            const paddingLeft = seriesRect.x - labelX;
            padding.left = (padding.left ?? 0) >= paddingLeft ? padding.left : paddingLeft;
        }

        if (labelY + labelHeight >= seriesRect.y + seriesRect.height) {
            const paddingbottom = labelY + labelHeight - (seriesRect.y + seriesRect.height);
            padding.bottom = (padding.bottom ?? 0) >= paddingbottom ? padding.bottom : paddingbottom;
        } else if (labelY <= seriesRect.y) {
            const paddingTop = seriesRect.y - labelY;
            padding.top = (padding.top ?? 0) >= paddingTop ? padding.top : paddingTop;
        }
    }
}
