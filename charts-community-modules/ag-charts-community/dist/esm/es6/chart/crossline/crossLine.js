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
import { labeldDirectionHandling, POSITION_TOP_COORDINATES, calculateLabelTranslation, } from './crossLineLabelPosition';
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
        const { autoRotation, labelRotation } = calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });
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
    computeLabelBBox() {
        return this.crossLineLabel.computeTransformedBBox();
    }
    calculatePadding(padding, seriesRect) {
        var _a, _b, _c, _d, _e, _f;
        const { isRange, startLine, endLine } = this;
        if (!isRange && !startLine && !endLine) {
            return;
        }
        const crossLineLabelBBox = this.computeLabelBBox();
        const labelX = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.x;
        const labelY = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.y;
        if (labelX == undefined || labelY == undefined) {
            return;
        }
        const labelWidth = (_a = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.width) !== null && _a !== void 0 ? _a : 0;
        const labelHeight = (_b = crossLineLabelBBox === null || crossLineLabelBBox === void 0 ? void 0 : crossLineLabelBBox.height) !== null && _b !== void 0 ? _b : 0;
        if (labelWidth > seriesRect.width || labelHeight > seriesRect.height) {
            // If label is bigger than seriesRect, trying to pad is just going to cause
            // layout instability.
            return;
        }
        if (labelX + labelWidth >= seriesRect.x + seriesRect.width) {
            const paddingRight = labelX + labelWidth - (seriesRect.x + seriesRect.width);
            padding.right = ((_c = padding.right) !== null && _c !== void 0 ? _c : 0) >= paddingRight ? padding.right : paddingRight;
        }
        else if (labelX <= seriesRect.x) {
            const paddingLeft = seriesRect.x - labelX;
            padding.left = ((_d = padding.left) !== null && _d !== void 0 ? _d : 0) >= paddingLeft ? padding.left : paddingLeft;
        }
        if (labelY + labelHeight >= seriesRect.y + seriesRect.height) {
            const paddingBottom = labelY + labelHeight - (seriesRect.y + seriesRect.height);
            padding.bottom = ((_e = padding.bottom) !== null && _e !== void 0 ? _e : 0) >= paddingBottom ? padding.bottom : paddingBottom;
        }
        else if (labelY <= seriesRect.y) {
            const paddingTop = seriesRect.y - labelY;
            padding.top = ((_f = padding.top) !== null && _f !== void 0 ? _f : 0) >= paddingTop ? padding.top : paddingTop;
        }
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
