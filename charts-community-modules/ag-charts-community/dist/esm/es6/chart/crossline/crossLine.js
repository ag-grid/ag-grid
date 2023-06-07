var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PointerEvents } from '../../scene/node';
import { Group } from '../../scene/group';
import { Text } from '../../scene/shape/text';
import { ContinuousScale } from '../../scale/continuousScale';
import { createId } from '../../util/id';
import { ChartAxisDirection } from '../chartAxisDirection';
import { labeldDirectionHandling, POSITION_TOP_COORDINATES, calculateLabelTranslation, calculateLabelChartPadding, } from './crossLineLabelPosition';
import { checkDatum } from '../../util/value';
import { Layers } from '../layers';
import { Range } from '../../scene/shape/range';
import { OPT_ARRAY, OPT_BOOLEAN, OPT_NUMBER, OPT_STRING, OPT_COLOR_STRING, STRING, Validate, OPT_LINE_DASH, OPT_FONT_STYLE, OPT_FONT_WEIGHT, NUMBER, OPTIONAL, predicateWithMessage, } from '../../util/validation';
import { calculateLabelRotation } from '../label';
const CROSSLINE_LABEL_POSITIONS = [
    'top',
    'left',
    'right',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
    'inside',
    'insideLeft',
    'insideRight',
    'insideTop',
    'insideBottom',
    'insideTopLeft',
    'insideBottomLeft',
    'insideTopRight',
    'insideBottomRight',
];
const OPT_CROSSLINE_LABEL_POSITION = predicateWithMessage((v, ctx) => OPTIONAL(v, ctx, (v) => CROSSLINE_LABEL_POSITIONS.includes(v)), `expecting an optional crossLine label position keyword such as 'topLeft', 'topRight' or 'inside'`);
const OPT_CROSSLINE_TYPE = predicateWithMessage((v, ctx) => OPTIONAL(v, ctx, (v) => v === 'range' || v === 'line'), `expecting a crossLine type keyword such as 'range' or 'line'`);
class CrossLineLabel {
    constructor() {
        this.enabled = undefined;
        this.text = undefined;
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 14;
        this.fontFamily = 'Verdana, sans-serif';
        /**
         * The padding between the label and the line.
         */
        this.padding = 5;
        /**
         * The color of the labels.
         */
        this.color = 'rgba(87, 87, 87, 1)';
        this.position = undefined;
        this.rotation = undefined;
        this.parallel = undefined;
    }
}
__decorate([
    Validate(OPT_BOOLEAN)
], CrossLineLabel.prototype, "enabled", void 0);
__decorate([
    Validate(OPT_STRING)
], CrossLineLabel.prototype, "text", void 0);
__decorate([
    Validate(OPT_FONT_STYLE)
], CrossLineLabel.prototype, "fontStyle", void 0);
__decorate([
    Validate(OPT_FONT_WEIGHT)
], CrossLineLabel.prototype, "fontWeight", void 0);
__decorate([
    Validate(NUMBER(0))
], CrossLineLabel.prototype, "fontSize", void 0);
__decorate([
    Validate(STRING)
], CrossLineLabel.prototype, "fontFamily", void 0);
__decorate([
    Validate(NUMBER(0))
], CrossLineLabel.prototype, "padding", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], CrossLineLabel.prototype, "color", void 0);
__decorate([
    Validate(OPT_CROSSLINE_LABEL_POSITION)
], CrossLineLabel.prototype, "position", void 0);
__decorate([
    Validate(OPT_NUMBER(-360, 360))
], CrossLineLabel.prototype, "rotation", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], CrossLineLabel.prototype, "parallel", void 0);
export class CrossLine {
    constructor() {
        this.id = createId(this);
        this.enabled = undefined;
        this.type = undefined;
        this.range = undefined;
        this.value = undefined;
        this.fill = undefined;
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = undefined;
        this.strokeOpacity = undefined;
        this.lineDash = undefined;
        this.label = new CrossLineLabel();
        this.scale = undefined;
        this.clippedRange = [-Infinity, Infinity];
        this.gridLength = 0;
        this.sideFlag = -1;
        this.parallelFlipRotation = 0;
        this.regularFlipRotation = 0;
        this.direction = ChartAxisDirection.X;
        this.group = new Group({ name: `${this.id}`, layer: true, zIndex: CrossLine.LINE_LAYER_ZINDEX });
        this.crossLineRange = new Range();
        this.crossLineLabel = new Text();
        this.labelPoint = undefined;
        this.data = [];
        this.startLine = false;
        this.endLine = false;
        this.isRange = false;
        const { group, crossLineRange, crossLineLabel } = this;
        group.append([crossLineRange, crossLineLabel]);
        crossLineRange.pointerEvents = PointerEvents.None;
    }
    update(visible) {
        if (!this.enabled) {
            return;
        }
        this.group.visible = visible;
        if (!visible) {
            return;
        }
        const dataCreated = this.createNodeData();
        if (!dataCreated) {
            this.group.visible = false;
            return;
        }
        this.updateNodes();
        this.group.zIndex = this.getZIndex(this.isRange);
    }
    updateNodes() {
        this.updateRangeNode();
        if (this.label.enabled) {
            this.updateLabel();
            this.positionLabel();
        }
    }
    createNodeData() {
        var _a, _b;
        const { scale, gridLength, sideFlag, direction, label: { position = 'top' }, clippedRange, strokeWidth = 0, } = this;
        if (!scale) {
            return false;
        }
        const bandwidth = (_a = scale.bandwidth) !== null && _a !== void 0 ? _a : 0;
        const clippedRangeClamper = (x) => Math.max(Math.min(...clippedRange), Math.min(Math.max(...clippedRange), x));
        const [xStart, xEnd] = [0, sideFlag * gridLength];
        let [yStart, yEnd] = this.getRange();
        let [clampedYStart, clampedYEnd] = [
            Number(scale.convert(yStart, { strict: false })),
            scale.convert(yEnd, { strict: false }) + bandwidth,
        ];
        clampedYStart = clippedRangeClamper(clampedYStart);
        clampedYEnd = clippedRangeClamper(clampedYEnd);
        [yStart, yEnd] = [Number(scale.convert(yStart)), scale.convert(yEnd) + bandwidth];
        const validRange = !isNaN(clampedYStart) &&
            !isNaN(clampedYEnd) &&
            (yStart === clampedYStart || yEnd === clampedYEnd || clampedYStart !== clampedYEnd) &&
            Math.abs(clampedYEnd - clampedYStart) > 0;
        if (validRange) {
            const reverse = clampedYStart !== Math.min(clampedYStart, clampedYEnd);
            if (reverse) {
                [clampedYStart, clampedYEnd] = [
                    Math.min(clampedYStart, clampedYEnd),
                    Math.max(clampedYStart, clampedYEnd),
                ];
                [yStart, yEnd] = [yEnd, yStart];
            }
        }
        this.isRange = validRange;
        this.startLine = !isNaN(yStart) && strokeWidth > 0 && yStart === clampedYStart;
        this.endLine = !isNaN(yEnd) && strokeWidth > 0 && yEnd === clampedYEnd;
        if (!validRange && !this.startLine && !this.endLine) {
            return false;
        }
        this.data = [clampedYStart, clampedYEnd];
        if (this.label.enabled) {
            const yDirection = direction === ChartAxisDirection.Y;
            const { c = POSITION_TOP_COORDINATES } = (_b = labeldDirectionHandling[position]) !== null && _b !== void 0 ? _b : {};
            const { x: labelX, y: labelY } = c({ yDirection, xStart, xEnd, yStart: clampedYStart, yEnd: clampedYEnd });
            this.labelPoint = {
                x: labelX,
                y: labelY,
            };
        }
        return true;
    }
    updateRangeNode() {
        var _a;
        const { crossLineRange, sideFlag, gridLength, data, startLine, endLine, isRange, fill, fillOpacity, stroke, strokeWidth, lineDash, } = this;
        crossLineRange.x1 = 0;
        crossLineRange.x2 = sideFlag * gridLength;
        crossLineRange.y1 = data[0];
        crossLineRange.y2 = data[1];
        crossLineRange.startLine = startLine;
        crossLineRange.endLine = endLine;
        crossLineRange.isRange = isRange;
        crossLineRange.fill = fill;
        crossLineRange.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
        crossLineRange.stroke = stroke;
        crossLineRange.strokeWidth = strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 1;
        crossLineRange.strokeOpacity = (_a = this.strokeOpacity) !== null && _a !== void 0 ? _a : 1;
        crossLineRange.lineDash = lineDash;
    }
    updateLabel() {
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
    positionLabel() {
        const { crossLineLabel, labelPoint: { x = undefined, y = undefined } = {}, label: { parallel, rotation, position = 'top', padding = 0 }, direction, parallelFlipRotation, regularFlipRotation, } = this;
        if (x === undefined || y === undefined) {
            return;
        }
        const { defaultRotation, configuredRotation } = calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });
        crossLineLabel.rotation = defaultRotation + configuredRotation;
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
    getZIndex(isRange = false) {
        if (isRange) {
            return CrossLine.RANGE_LAYER_ZINDEX;
        }
        return CrossLine.LINE_LAYER_ZINDEX;
    }
    getRange() {
        const { value, range, scale } = this;
        const isContinuous = scale instanceof ContinuousScale;
        let [start, end] = range !== null && range !== void 0 ? range : [value, undefined];
        if (!isContinuous && end === undefined) {
            end = start;
        }
        start = checkDatum(start, isContinuous) != null ? start : undefined;
        end = checkDatum(end, isContinuous) != null ? end : undefined;
        if (isContinuous && start === end) {
            end = undefined;
        }
        if (start === undefined && end !== undefined) {
            start = end;
            end = undefined;
        }
        return [start, end];
    }
    computeLabelBBox() {
        return this.crossLineLabel.computeTransformedBBox();
    }
    calculatePadding(padding) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { isRange, startLine, endLine, direction, label: { padding: labelPadding = 0, position = 'top' }, } = this;
        if (!isRange && !startLine && !endLine) {
            return;
        }
        const crossLineLabelBBox = this.computeLabelBBox();
        const labelX = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.x;
        const labelY = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.y;
        if (!crossLineLabelBBox || labelX == undefined || labelY == undefined) {
            return;
        }
        const chartPadding = calculateLabelChartPadding({
            yDirection: direction === ChartAxisDirection.Y,
            padding: labelPadding,
            position,
            bbox: crossLineLabelBBox,
        });
        padding.left = Math.max((_a = padding.left) !== null && _a !== void 0 ? _a : 0, (_b = chartPadding.left) !== null && _b !== void 0 ? _b : 0);
        padding.right = Math.max((_c = padding.right) !== null && _c !== void 0 ? _c : 0, (_d = chartPadding.right) !== null && _d !== void 0 ? _d : 0);
        padding.top = Math.max((_e = padding.top) !== null && _e !== void 0 ? _e : 0, (_f = chartPadding.top) !== null && _f !== void 0 ? _f : 0);
        padding.bottom = Math.max((_g = padding.bottom) !== null && _g !== void 0 ? _g : 0, (_h = chartPadding.bottom) !== null && _h !== void 0 ? _h : 0);
    }
}
CrossLine.LINE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_LINE_ZINDEX;
CrossLine.RANGE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
CrossLine.className = 'CrossLine';
__decorate([
    Validate(OPT_BOOLEAN)
], CrossLine.prototype, "enabled", void 0);
__decorate([
    Validate(OPT_CROSSLINE_TYPE)
], CrossLine.prototype, "type", void 0);
__decorate([
    Validate(OPT_ARRAY(2))
], CrossLine.prototype, "range", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], CrossLine.prototype, "fill", void 0);
__decorate([
    Validate(OPT_NUMBER(0, 1))
], CrossLine.prototype, "fillOpacity", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], CrossLine.prototype, "stroke", void 0);
__decorate([
    Validate(OPT_NUMBER())
], CrossLine.prototype, "strokeWidth", void 0);
__decorate([
    Validate(OPT_NUMBER(0, 1))
], CrossLine.prototype, "strokeOpacity", void 0);
__decorate([
    Validate(OPT_LINE_DASH)
], CrossLine.prototype, "lineDash", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NMaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2Nyb3NzbGluZS9jcm9zc0xpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFHOUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUVILHVCQUF1QixFQUN2Qix3QkFBd0IsRUFDeEIseUJBQXlCLEVBQ3pCLDBCQUEwQixHQUM3QixNQUFNLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRW5DLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNoRCxPQUFPLEVBQ0gsU0FBUyxFQUNULFdBQVcsRUFDWCxVQUFVLEVBQ1YsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEVBQ04sUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsZUFBZSxFQUNmLE1BQU0sRUFDTixRQUFRLEVBQ1Isb0JBQW9CLEdBQ3ZCLE1BQU0sdUJBQXVCLENBQUM7QUFFL0IsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWxELE1BQU0seUJBQXlCLEdBQUc7SUFDOUIsS0FBSztJQUNMLE1BQU07SUFDTixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFD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