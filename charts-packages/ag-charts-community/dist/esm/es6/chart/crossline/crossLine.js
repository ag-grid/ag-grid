import { PointerEvents } from '../../scene/node';
import { Group } from '../../scene/group';
import { Path } from '../../scene/shape/path';
import { Text } from '../../scene/shape/text';
import { clamper, ContinuousScale } from '../../scale/continuousScale';
import { createId } from '../../util/id';
import { normalizeAngle360, toRadians } from '../../util/angle';
import { ChartAxisDirection } from '../chartAxis';
import { labeldDirectionHandling, POSITION_TOP_COORDINATES, calculateLabelTranslation, } from './crossLineLabelPosition';
import { checkDatum } from '../../util/value';
import { Layers } from '../layers';
export class CrossLineLabel {
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
        this.gridLength = 0;
        this.sideFlag = -1;
        this.parallelFlipRotation = 0;
        this.regularFlipRotation = 0;
        this.direction = ChartAxisDirection.X;
        this.group = new Group({ name: `${this.id}`, layer: true, zIndex: CrossLine.LINE_LAYER_ZINDEX });
        this.crossLineLabel = new Text();
        this.crossLineLine = new Path();
        this.crossLineRange = new Path();
        this.labelPoint = undefined;
        this.fillData = undefined;
        this.strokeData = undefined;
        const { group, crossLineLine, crossLineRange, crossLineLabel } = this;
        group.append([crossLineRange, crossLineLine, crossLineLabel]);
        crossLineLine.fill = undefined;
        crossLineLine.pointerEvents = PointerEvents.None;
        crossLineRange.pointerEvents = PointerEvents.None;
    }
    getZIndex(type = 'line') {
        if (type === 'range') {
            return CrossLine.RANGE_LAYER_ZINDEX;
        }
        return CrossLine.LINE_LAYER_ZINDEX;
    }
    update(visible) {
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
    updatePaths() {
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
    createNodeData() {
        var _a, _b;
        const { scale, gridLength, sideFlag, direction, label: { position = 'top' }, } = this;
        if (!scale) {
            return false;
        }
        const isContinuous = scale instanceof ContinuousScale;
        const bandwidth = (_a = scale.bandwidth, (_a !== null && _a !== void 0 ? _a : 0));
        let xStart, xEnd, yStart, yEnd, clampedYStart, clampedYEnd;
        this.fillData = { points: [] };
        this.strokeData = { points: [] };
        [xStart, xEnd] = [0, sideFlag * gridLength];
        [yStart, yEnd] = this.getRange();
        let isLine = false;
        if (yStart === undefined) {
            return false;
        }
        else if (yEnd === undefined) {
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
        this.strokeData.points.push({
            x: xStart,
            y: yStart,
        }, {
            x: xEnd,
            y: yStart,
        }, {
            x: xEnd,
            y: yEnd,
        }, {
            x: xStart,
            y: yEnd,
        });
        this.fillData.points.push({
            x: xStart,
            y: clampedYStart,
        }, {
            x: xEnd,
            y: clampedYStart,
        }, {
            x: xEnd,
            y: clampedYEnd,
        }, {
            x: xStart,
            y: clampedYEnd,
        });
        if (this.label.enabled) {
            const yDirection = direction === ChartAxisDirection.Y;
            const { c = POSITION_TOP_COORDINATES } = (_b = labeldDirectionHandling[position], (_b !== null && _b !== void 0 ? _b : {}));
            const { x: labelX, y: labelY } = c({ yDirection, xStart, xEnd, yStart: clampedYStart, yEnd: clampedYEnd });
            this.labelPoint = {
                x: labelX,
                y: labelY,
            };
        }
        return true;
    }
    updateLinePath() {
        const { crossLineLine, strokeData = { points: [] } } = this;
        const pathMethods = ['moveTo', 'lineTo', 'moveTo', 'lineTo'];
        const points = strokeData.points;
        const { path } = crossLineLine;
        path.clear({ trackChanges: true });
        pathMethods.forEach((method, i) => {
            const { x, y } = points[i];
            path[method](x, y);
        });
        crossLineLine.checkPathDirty();
    }
    updateLineNode() {
        var _a;
        const { crossLineLine, stroke, strokeWidth, lineDash } = this;
        crossLineLine.stroke = stroke;
        crossLineLine.strokeWidth = (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 1);
        crossLineLine.opacity = (_a = this.strokeOpacity, (_a !== null && _a !== void 0 ? _a : 1));
        crossLineLine.lineDash = lineDash;
    }
    updateRangeNode() {
        const { crossLineRange, fill, fillOpacity } = this;
        crossLineRange.fill = fill;
        crossLineRange.opacity = (fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1);
    }
    updateRangePath() {
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
        const labelRotation = rotation ? normalizeAngle360(toRadians(rotation)) : 0;
        const parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
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
    getRange() {
        const { value, range, scale } = this;
        const isContinuous = scale instanceof ContinuousScale;
        let [start, end] = (range !== null && range !== void 0 ? range : [value, undefined]);
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const crossLineLabelBBox = this.computeLabelBBox();
        const labelX = (_a = crossLineLabelBBox) === null || _a === void 0 ? void 0 : _a.x;
        const labelY = (_b = crossLineLabelBBox) === null || _b === void 0 ? void 0 : _b.y;
        if (labelX == undefined || labelY == undefined) {
            return;
        }
        const labelWidth = (_d = (_c = crossLineLabelBBox) === null || _c === void 0 ? void 0 : _c.width, (_d !== null && _d !== void 0 ? _d : 0));
        const labelHeight = (_f = (_e = crossLineLabelBBox) === null || _e === void 0 ? void 0 : _e.height, (_f !== null && _f !== void 0 ? _f : 0));
        if (labelX + labelWidth >= seriesRect.x + seriesRect.width) {
            const paddingRight = labelX + labelWidth - (seriesRect.x + seriesRect.width);
            padding.right = (_g = padding.right, (_g !== null && _g !== void 0 ? _g : 0)) >= paddingRight ? padding.right : paddingRight;
        }
        else if (labelX <= seriesRect.x) {
            const paddingLeft = seriesRect.x - labelX;
            padding.left = (_h = padding.left, (_h !== null && _h !== void 0 ? _h : 0)) >= paddingLeft ? padding.left : paddingLeft;
        }
        if (labelY + labelHeight >= seriesRect.y + seriesRect.height) {
            const paddingbottom = labelY + labelHeight - (seriesRect.y + seriesRect.height);
            padding.bottom = (_j = padding.bottom, (_j !== null && _j !== void 0 ? _j : 0)) >= paddingbottom ? padding.bottom : paddingbottom;
        }
        else if (labelY <= seriesRect.y) {
            const paddingTop = seriesRect.y - labelY;
            padding.top = (_k = padding.top, (_k !== null && _k !== void 0 ? _k : 0)) >= paddingTop ? padding.top : paddingTop;
        }
    }
}
CrossLine.LINE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_LINE_ZINDEX;
CrossLine.RANGE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
CrossLine.className = 'CrossLine';
