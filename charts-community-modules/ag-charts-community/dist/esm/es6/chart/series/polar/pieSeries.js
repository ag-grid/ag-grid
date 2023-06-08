var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Group } from '../../../scene/group';
import { Line } from '../../../scene/shape/line';
import { Text } from '../../../scene/shape/text';
import { Circle } from '../../marker/circle';
import { Selection } from '../../../scene/selection';
import { LinearScale } from '../../../scale/linearScale';
import { Sector } from '../../../scene/shape/sector';
import { BBox } from '../../../scene/bbox';
import { HighlightStyle, SeriesTooltip, SeriesNodeBaseClickEvent, valueProperty, rangedValueProperty, accumulativeValueProperty, } from './../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { normalizeAngle180, toRadians } from '../../../util/angle';
import { toFixed, mod } from '../../../util/number';
import { Layers } from '../../layers';
import { Caption } from '../../../caption';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { isPointInSector, boxCollidesSector } from '../../../util/sector';
import { BOOLEAN, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, OPT_STRING, STRING, COLOR_STRING_ARRAY, OPT_COLOR_STRING_ARRAY, Validate, COLOR_STRING, } from '../../../util/validation';
import { StateMachine } from '../../../motion/states';
import * as easing from '../../../motion/easing';
import { DataModel } from '../../data/dataModel';
import { normalisePropertyTo } from '../../data/processors';
class PieSeriesNodeBaseClickEvent extends SeriesNodeBaseClickEvent {
    constructor(angleKey, calloutLabelKey, sectorLabelKey, radiusKey, nativeEvent, datum, series) {
        super(nativeEvent, datum, series);
        this.angleKey = angleKey;
        this.calloutLabelKey = calloutLabelKey;
        this.sectorLabelKey = sectorLabelKey;
        this.radiusKey = radiusKey;
    }
}
class PieSeriesNodeClickEvent extends PieSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeClick';
    }
}
class PieSeriesNodeDoubleClickEvent extends PieSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeDoubleClick';
    }
}
var PieNodeTag;
(function (PieNodeTag) {
    PieNodeTag[PieNodeTag["Sector"] = 0] = "Sector";
    PieNodeTag[PieNodeTag["Callout"] = 1] = "Callout";
    PieNodeTag[PieNodeTag["Label"] = 2] = "Label";
})(PieNodeTag || (PieNodeTag = {}));
class PieSeriesCalloutLabel extends Label {
    constructor() {
        super(...arguments);
        this.offset = 3; // from the callout line
        this.minAngle = 0; // in degrees
        this.formatter = undefined;
        this.minSpacing = 4;
        this.maxCollisionOffset = 50;
    }
}
__decorate([
    Validate(NUMBER(0))
], PieSeriesCalloutLabel.prototype, "offset", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeriesCalloutLabel.prototype, "minAngle", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], PieSeriesCalloutLabel.prototype, "formatter", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeriesCalloutLabel.prototype, "minSpacing", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeriesCalloutLabel.prototype, "maxCollisionOffset", void 0);
class PieSeriesSectorLabel extends Label {
    constructor() {
        super(...arguments);
        this.positionOffset = 0;
        this.positionRatio = 0.5;
        this.formatter = undefined;
    }
}
__decorate([
    Validate(NUMBER())
], PieSeriesSectorLabel.prototype, "positionOffset", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], PieSeriesSectorLabel.prototype, "positionRatio", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], PieSeriesSectorLabel.prototype, "formatter", void 0);
class PieSeriesCalloutLine {
    constructor() {
        this.colors = undefined;
        this.length = 10;
        this.strokeWidth = 1;
    }
}
__decorate([
    Validate(OPT_COLOR_STRING_ARRAY)
], PieSeriesCalloutLine.prototype, "colors", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeriesCalloutLine.prototype, "length", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeriesCalloutLine.prototype, "strokeWidth", void 0);
class PieSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], PieSeriesTooltip.prototype, "renderer", void 0);
export class PieTitle extends Caption {
    constructor() {
        super(...arguments);
        this.showInLegend = false;
    }
}
__decorate([
    Validate(BOOLEAN)
], PieTitle.prototype, "showInLegend", void 0);
export class DoughnutInnerLabel extends Label {
    constructor() {
        super(...arguments);
        this.text = '';
        this.margin = 2;
    }
}
__decorate([
    Validate(STRING)
], DoughnutInnerLabel.prototype, "text", void 0);
__decorate([
    Validate(NUMBER())
], DoughnutInnerLabel.prototype, "margin", void 0);
export class DoughnutInnerCircle {
    constructor() {
        this.fill = 'transparent';
        this.fillOpacity = 1;
    }
}
__decorate([
    Validate(COLOR_STRING)
], DoughnutInnerCircle.prototype, "fill", void 0);
__decorate([
    Validate(OPT_NUMBER(0, 1))
], DoughnutInnerCircle.prototype, "fillOpacity", void 0);
class PieStateMachine extends StateMachine {
}
export class PieSeries extends PolarSeries {
    constructor(moduleCtx) {
        super({ moduleCtx, useLabelLayer: true });
        this.radiusScale = new LinearScale();
        this.groupSelection = Selection.select(this.contentGroup, Group);
        this.highlightSelection = Selection.select(this.highlightGroup, Group);
        this.nodeData = [];
        // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
        this.seriesItemEnabled = [];
        this.title = undefined;
        this.calloutLabel = new PieSeriesCalloutLabel();
        this.sectorLabel = new PieSeriesSectorLabel();
        this.calloutLine = new PieSeriesCalloutLine();
        this.tooltip = new PieSeriesTooltip();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie sector angle).
         */
        this.angleKey = '';
        this.angleName = '';
        this.innerLabels = [];
        this.innerCircle = undefined;
        /**
         * The key of the numeric field to use to determine the radii of pie sectors.
         * The largest value will correspond to the full radius and smaller values to
         * proportionally smaller radii.
         */
        this.radiusKey = undefined;
        this.radiusName = undefined;
        this.radiusMin = undefined;
        this.radiusMax = undefined;
        this.calloutLabelKey = undefined;
        this.calloutLabelName = undefined;
        this.sectorLabelKey = undefined;
        this.sectorLabelName = undefined;
        this.legendItemKey = undefined;
        this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.formatter = undefined;
        /**
         * The series rotation in degrees.
         */
        this.rotation = 0;
        this.outerRadiusOffset = 0;
        this.outerRadiusRatio = 1;
        this.innerRadiusOffset = 0;
        this.innerRadiusRatio = 1;
        this.strokeWidth = 1;
        this.shadow = undefined;
        this.highlightStyle = new HighlightStyle();
        this.surroundingRadius = undefined;
        this.angleScale = new LinearScale();
        // Each sector is a ratio of the whole, where all ratios add up to 1.
        this.angleScale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        this.angleScale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
        this.backgroundGroup = this.rootGroup.appendChild(new Group({
            name: `${this.id}-background`,
            layer: true,
            zIndex: Layers.SERIES_BACKGROUND_ZINDEX,
        }));
        const pieCalloutLabels = new Group({ name: 'pieCalloutLabels' });
        const pieSectorLabels = new Group({ name: 'pieSectorLabels' });
        const innerLabels = new Group({ name: 'innerLabels' });
        this.labelGroup.append(pieCalloutLabels);
        this.labelGroup.append(pieSectorLabels);
        this.labelGroup.append(innerLabels);
        this.calloutLabelSelection = Selection.select(pieCalloutLabels, Group);
        this.sectorLabelSelection = Selection.select(pieSectorLabels, Text);
        this.innerLabelsSelection = Selection.select(innerLabels, Text);
        this.animationState = new PieStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'ready',
                        action: () => this.animateEmptyUpdateReady(),
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: () => this.animateReadyUpdateReady(),
                    },
                },
            },
        });
    }
    set data(input) {
        this._data = input;
        this.processSeriesItemEnabled();
    }
    get data() {
        return this._data;
    }
    addChartEventListeners() {
        var _a;
        (_a = this.chartEventManager) === null || _a === void 0 ? void 0 : _a.addListener('legend-item-click', (event) => this.onLegendItemClick(event));
    }
    visibleChanged() {
        this.processSeriesItemEnabled();
    }
    processSeriesItemEnabled() {
        var _a;
        const { data, visible } = this;
        this.seriesItemEnabled = (_a = data === null || data === void 0 ? void 0 : data.map(() => visible)) !== null && _a !== void 0 ? _a : [];
    }
    getDomain(direction) {
        if (direction === ChartAxisDirection.X) {
            return this.angleScale.domain;
        }
        else {
            return this.radiusScale.domain;
        }
    }
    processData() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let { data = [] } = this;
            const { angleKey, radiusKey, seriesItemEnabled } = this;
            if (!angleKey)
                return;
            const extraProps = [];
            if (radiusKey) {
                extraProps.push(rangedValueProperty(radiusKey, { id: 'radiusValue', min: (_a = this.radiusMin) !== null && _a !== void 0 ? _a : 0, max: this.radiusMax }), valueProperty(radiusKey, true, { id: `radiusRaw` }), // Raw value pass-through.
                normalisePropertyTo({ id: 'radiusValue' }, [0, 1], (_b = this.radiusMin) !== null && _b !== void 0 ? _b : 0, this.radiusMax));
                extraProps.push();
            }
            data = data.map((d, idx) => (seriesItemEnabled[idx] ? d : Object.assign(Object.assign({}, d), { [angleKey]: 0 })));
            this.dataModel = new DataModel({
                props: [
                    accumulativeValueProperty(angleKey, true, { id: `angleValue` }),
                    valueProperty(angleKey, true, { id: `angleRaw` }),
                    normalisePropertyTo({ id: 'angleValue' }, [0, 1], 0),
                    ...extraProps,
                ],
            });
            this.processedData = this.dataModel.processData(data);
        });
    }
    maybeRefreshNodeData() {
        if (!this.nodeDataRefresh)
            return;
        const [{ nodeData = [] } = {}] = this._createNodeData();
        this.nodeData = nodeData;
        this.nodeDataRefresh = false;
    }
    createNodeData() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._createNodeData();
        });
    }
    _createNodeData() {
        var _a, _b, _c, _d;
        const { id: seriesId, processedData, dataModel, rotation, angleScale } = this;
        if (!processedData || !dataModel || processedData.type !== 'ungrouped')
            return [];
        const angleIdx = (_b = (_a = dataModel.resolveProcessedDataIndexById(`angleValue`)) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1;
        const radiusIdx = (_d = (_c = dataModel.resolveProcessedDataIndexById(`radiusValue`)) === null || _c === void 0 ? void 0 : _c.index) !== null && _d !== void 0 ? _d : -1;
        if (angleIdx < 0)
            return [];
        let currentStart = 0;
        const nodeData = processedData.data.map((group, index) => {
            var _a;
            const { datum, values } = group;
            const currentValue = values[angleIdx];
            const startAngle = angleScale.convert(currentStart) + toRadians(rotation);
            currentStart = currentValue;
            const endAngle = angleScale.convert(currentStart) + toRadians(rotation);
            const span = Math.abs(endAngle - startAngle);
            const midAngle = startAngle + span / 2;
            const angleValue = values[angleIdx + 1];
            const radius = radiusIdx >= 0 ? (_a = values[radiusIdx]) !== null && _a !== void 0 ? _a : 1 : 1;
            const radiusValue = radiusIdx >= 0 ? values[radiusIdx + 1] : undefined;
            const labels = this.getLabels(datum, midAngle, span, true);
            const sectorFormat = this.getSectorFormat(datum, index, index, false);
            return Object.assign({ itemId: index, series: this, datum,
                index,
                angleValue,
                midAngle, midCos: Math.cos(midAngle), midSin: Math.sin(midAngle), startAngle,
                endAngle,
                sectorFormat,
                radius,
                radiusValue }, labels);
        });
        return [
            {
                itemId: seriesId,
                nodeData,
                labelData: nodeData,
            },
        ];
    }
    getLabels(datum, midAngle, span, skipDisabled) {
        const { calloutLabel, sectorLabel, legendItemKey, ctx: { callbackCache }, } = this;
        const calloutLabelKey = !skipDisabled || calloutLabel.enabled ? this.calloutLabelKey : undefined;
        const sectorLabelKey = !skipDisabled || sectorLabel.enabled ? this.sectorLabelKey : undefined;
        if (!calloutLabelKey && !sectorLabelKey && !legendItemKey)
            return {};
        const labelFormatterParams = this.getLabelFormatterParams(datum);
        let calloutLabelText;
        if (calloutLabelKey) {
            const calloutLabelMinAngle = toRadians(calloutLabel.minAngle);
            const calloutLabelVisible = span > calloutLabelMinAngle;
            if (!calloutLabelVisible) {
                calloutLabelText = undefined;
            }
            else if (calloutLabel.formatter) {
                calloutLabelText = callbackCache.call(calloutLabel.formatter, labelFormatterParams);
            }
            else {
                calloutLabelText = String(datum[calloutLabelKey]);
            }
        }
        let sectorLabelText;
        if (sectorLabelKey) {
            if (sectorLabel.formatter) {
                sectorLabelText = callbackCache.call(sectorLabel.formatter, labelFormatterParams);
            }
            else {
                sectorLabelText = String(datum[sectorLabelKey]);
            }
        }
        let legendItemText;
        if (legendItemKey) {
            legendItemText = String(datum[legendItemKey]);
        }
        return Object.assign(Object.assign(Object.assign({}, (calloutLabelText != null
            ? {
                calloutLabel: Object.assign(Object.assign({}, this.getTextAlignment(midAngle)), { text: calloutLabelText, hidden: false, collisionTextAlign: undefined, collisionOffsetY: 0, box: undefined }),
            }
            : {})), (sectorLabelText != null ? { sectorLabel: { text: sectorLabelText } } : {})), (legendItemKey != null && legendItemText != null
            ? { legendItem: { key: legendItemKey, text: legendItemText } }
            : {}));
    }
    getLabelFormatterParams(datum) {
        const { id: seriesId, radiusKey, radiusName, angleKey, angleName, calloutLabelKey, calloutLabelName, sectorLabelKey, sectorLabelName, } = this;
        return {
            datum,
            angleKey,
            angleValue: datum[angleKey],
            angleName,
            radiusKey,
            radiusValue: radiusKey ? datum[radiusKey] : undefined,
            radiusName,
            calloutLabelKey,
            calloutLabelValue: calloutLabelKey ? datum[calloutLabelKey] : undefined,
            calloutLabelName,
            sectorLabelKey,
            sectorLabelValue: sectorLabelKey ? datum[sectorLabelKey] : undefined,
            sectorLabelName,
            seriesId,
        };
    }
    getTextAlignment(midAngle) {
        const quadrantTextOpts = [
            { textAlign: 'center', textBaseline: 'bottom' },
            { textAlign: 'left', textBaseline: 'middle' },
            { textAlign: 'center', textBaseline: 'hanging' },
            { textAlign: 'right', textBaseline: 'middle' },
        ];
        const midAngle180 = normalizeAngle180(midAngle);
        // Split the circle into quadrants like so: ⊗
        const quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
        const quadrantOffset = midAngle180 - quadrantStart;
        const quadrant = Math.floor(quadrantOffset / (Math.PI / 2));
        const quadrantIndex = mod(quadrant, quadrantTextOpts.length);
        return quadrantTextOpts[quadrantIndex];
    }
    getSectorFormat(datum, itemId, index, highlight) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const { angleKey, radiusKey, fills, strokes, fillOpacity: seriesFillOpacity, formatter, id: seriesId, ctx: { callbackCache }, } = this;
        const highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        const isDatumHighlighted = highlight && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this && itemId === highlightedDatum.itemId;
        const highlightedStyle = isDatumHighlighted ? this.highlightStyle.item : null;
        const fill = (_b = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fill) !== null && _b !== void 0 ? _b : fills[index % fills.length];
        const fillOpacity = (_c = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fillOpacity) !== null && _c !== void 0 ? _c : seriesFillOpacity;
        const stroke = (_d = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.stroke) !== null && _d !== void 0 ? _d : strokes[index % strokes.length];
        const strokeWidth = (_e = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.strokeWidth) !== null && _e !== void 0 ? _e : this.getStrokeWidth(this.strokeWidth);
        let format;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum,
                angleKey,
                radiusKey,
                fill,
                stroke,
                strokeWidth,
                highlighted: isDatumHighlighted,
                seriesId,
            });
        }
        return {
            fill: (_f = format === null || format === void 0 ? void 0 : format.fill) !== null && _f !== void 0 ? _f : fill,
            fillOpacity: (_g = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _g !== void 0 ? _g : fillOpacity,
            stroke: (_h = format === null || format === void 0 ? void 0 : format.stroke) !== null && _h !== void 0 ? _h : stroke,
            strokeWidth: (_j = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _j !== void 0 ? _j : strokeWidth,
        };
    }
    getInnerRadius() {
        const { radius, innerRadiusRatio, innerRadiusOffset } = this;
        const innerRadius = radius * (innerRadiusRatio !== null && innerRadiusRatio !== void 0 ? innerRadiusRatio : 1) + (innerRadiusOffset ? innerRadiusOffset : 0);
        if (innerRadius === radius || innerRadius < 0) {
            return 0;
        }
        return innerRadius;
    }
    getOuterRadius() {
        const { radius, outerRadiusRatio, outerRadiusOffset } = this;
        const outerRadius = radius * (outerRadiusRatio !== null && outerRadiusRatio !== void 0 ? outerRadiusRatio : 1) + (outerRadiusOffset ? outerRadiusOffset : 0);
        if (outerRadius < 0) {
            return 0;
        }
        return outerRadius;
    }
    updateRadiusScale() {
        const innerRadius = this.getInnerRadius();
        const outerRadius = this.getOuterRadius();
        this.radiusScale.range = [innerRadius, outerRadius];
    }
    getTitleTranslationY() {
        var _a, _b;
        const outerRadius = Math.max(0, this.radiusScale.range[1]);
        if (outerRadius === 0) {
            return NaN;
        }
        const spacing = (_b = (_a = this.title) === null || _a === void 0 ? void 0 : _a.spacing) !== null && _b !== void 0 ? _b : 0;
        const titleOffset = 2 + spacing;
        const dy = Math.max(0, -outerRadius);
        return -outerRadius - titleOffset - dy;
    }
    update({ seriesRect }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title } = this;
            this.maybeRefreshNodeData();
            this.updateTitleNodes();
            this.updateRadiusScale();
            this.updateInnerCircleNodes();
            this.rootGroup.translationX = this.centerX;
            this.rootGroup.translationY = this.centerY;
            if (title) {
                const dy = this.getTitleTranslationY();
                const titleBox = title.node.computeBBox();
                title.node.visible =
                    title.enabled && isFinite(dy) && !this.bboxIntersectsSurroundingSeries(titleBox, 0, dy);
                title.node.translationY = isFinite(dy) ? dy : 0;
            }
            this.updateNodeMidPoint();
            yield this.updateSelections();
            yield this.updateNodes(seriesRect);
        });
    }
    updateTitleNodes() {
        var _a, _b;
        const { title, oldTitle } = this;
        if (oldTitle !== title) {
            if (oldTitle) {
                (_a = this.labelGroup) === null || _a === void 0 ? void 0 : _a.removeChild(oldTitle.node);
            }
            if (title) {
                title.node.textBaseline = 'bottom';
                (_b = this.labelGroup) === null || _b === void 0 ? void 0 : _b.appendChild(title.node);
            }
            this.oldTitle = title;
        }
    }
    updateInnerCircleNodes() {
        var _a;
        const { innerCircle, oldInnerCircle, innerCircleNode: oldNode } = this;
        if (oldInnerCircle !== innerCircle) {
            let circle;
            if (oldNode) {
                this.backgroundGroup.removeChild(oldNode);
            }
            if (innerCircle) {
                circle = new Circle();
                circle.fill = innerCircle.fill;
                circle.fillOpacity = (_a = innerCircle.fillOpacity) !== null && _a !== void 0 ? _a : 1;
                this.backgroundGroup.appendChild(circle);
            }
            this.oldInnerCircle = innerCircle;
            this.innerCircleNode = circle;
        }
    }
    updateNodeMidPoint() {
        this.nodeData.forEach((d) => {
            const radius = this.radiusScale.convert(d.radius);
            d.nodeMidPoint = {
                x: d.midCos * Math.max(0, radius / 2),
                y: d.midSin * Math.max(0, radius / 2),
            };
        });
    }
    updateSelections() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateGroupSelection();
        });
    }
    updateGroupSelection() {
        return __awaiter(this, void 0, void 0, function* () {
            const { groupSelection, highlightSelection, calloutLabelSelection, sectorLabelSelection, innerLabelsSelection, } = this;
            const update = (selection) => {
                return selection.update(this.nodeData, (group) => {
                    const sector = new Sector();
                    sector.tag = PieNodeTag.Sector;
                    group.appendChild(sector);
                });
            };
            this.groupSelection = update(groupSelection);
            this.highlightSelection = update(highlightSelection);
            calloutLabelSelection.update(this.nodeData, (group) => {
                const line = new Line();
                line.tag = PieNodeTag.Callout;
                line.pointerEvents = PointerEvents.None;
                group.appendChild(line);
                const text = new Text();
                text.tag = PieNodeTag.Label;
                text.pointerEvents = PointerEvents.None;
                group.appendChild(text);
            });
            sectorLabelSelection.update(this.nodeData, (node) => {
                node.pointerEvents = PointerEvents.None;
            });
            innerLabelsSelection.update(this.innerLabels, (node) => {
                node.pointerEvents = PointerEvents.None;
            });
        });
    }
    updateNodes(seriesRect) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
            const isVisible = this.seriesItemEnabled.indexOf(true) >= 0;
            this.rootGroup.visible = isVisible;
            this.backgroundGroup.visible = isVisible;
            this.contentGroup.visible = isVisible;
            this.highlightGroup.visible = isVisible && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this;
            this.labelGroup.visible = isVisible;
            this.contentGroup.opacity = this.getOpacity();
            this.updateInnerCircle();
            const { radiusScale } = this;
            const innerRadius = radiusScale.convert(0);
            const updateSectorFn = (sector, datum, index, isDatumHighlighted) => {
                const radius = radiusScale.convert(datum.radius);
                // Bring highlighted sector's parent group to front.
                const sectorParent = sector.parent;
                const sectorGrandParent = sectorParent === null || sectorParent === void 0 ? void 0 : sectorParent.parent;
                if (isDatumHighlighted && sectorParent && sectorGrandParent) {
                    sectorGrandParent.removeChild(sectorParent);
                    sectorGrandParent.appendChild(sectorParent);
                }
                sector.innerRadius = Math.max(0, innerRadius);
                sector.outerRadius = Math.max(0, radius);
                if (isDatumHighlighted) {
                    sector.startAngle = datum.startAngle;
                    sector.endAngle = datum.endAngle;
                }
                const format = this.getSectorFormat(datum.datum, datum.itemId, index, isDatumHighlighted);
                sector.fill = format.fill;
                sector.stroke = format.stroke;
                sector.strokeWidth = format.strokeWidth;
                sector.fillOpacity = format.fillOpacity;
                sector.strokeOpacity = this.strokeOpacity;
                sector.lineDash = this.lineDash;
                sector.lineDashOffset = this.lineDashOffset;
                sector.fillShadow = this.shadow;
                sector.lineJoin = 'round';
                sector.visible = this.seriesItemEnabled[index];
            };
            this.groupSelection
                .selectByTag(PieNodeTag.Sector)
                .forEach((node, index) => updateSectorFn(node, node.datum, index, false));
            this.highlightSelection.selectByTag(PieNodeTag.Sector).forEach((node, index) => {
                const isDatumHighlighted = (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this && node.datum.itemId === highlightedDatum.itemId;
                node.visible = isDatumHighlighted;
                if (node.visible) {
                    updateSectorFn(node, node.datum, index, isDatumHighlighted);
                }
            });
            this.animationState.transition('update');
            this.updateCalloutLineNodes();
            this.updateCalloutLabelNodes(seriesRect);
            this.updateSectorLabelNodes();
            this.updateInnerLabelNodes();
        });
    }
    updateCalloutLineNodes() {
        var _a;
        const { radiusScale, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const calloutStrokeWidth = calloutLine.strokeWidth;
        const calloutColors = (_a = calloutLine.colors) !== null && _a !== void 0 ? _a : this.strokes;
        const { offset } = this.calloutLabel;
        this.calloutLabelSelection.selectByTag(PieNodeTag.Callout).forEach((line, index) => {
            const datum = line.datum;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            const label = datum.calloutLabel;
            if ((label === null || label === void 0 ? void 0 : label.text) && !label.hidden && outerRadius !== 0) {
                line.visible = true;
                line.strokeWidth = calloutStrokeWidth;
                line.stroke = calloutColors[index % calloutColors.length];
                line.fill = undefined;
                const x1 = datum.midCos * outerRadius;
                const y1 = datum.midSin * outerRadius;
                let x2 = datum.midCos * (outerRadius + calloutLength);
                let y2 = datum.midSin * (outerRadius + calloutLength);
                if (label.collisionTextAlign || label.collisionOffsetY !== 0) {
                    // Get the closest point to the text bounding box
                    const box = label.box;
                    let cx = x2;
                    let cy = y2;
                    if (x2 < box.x) {
                        cx = box.x;
                    }
                    else if (x2 > box.x + box.width) {
                        cx = box.x + box.width;
                    }
                    if (y2 < box.y) {
                        cy = box.y;
                    }
                    else if (y2 > box.y + box.height) {
                        cy = box.y + box.height;
                    }
                    // Apply label offset
                    const dx = cx - x2;
                    const dy = cy - y2;
                    const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    const paddedLength = length - offset;
                    if (paddedLength > 0) {
                        x2 = x2 + (dx * paddedLength) / length;
                        y2 = y2 + (dy * paddedLength) / length;
                    }
                }
                line.x1 = x1;
                line.y1 = y1;
                line.x2 = x2;
                line.y2 = y2;
            }
            else {
                line.visible = false;
            }
        });
    }
    getLabelOverflow(text, box, seriesRect) {
        const seriesLeft = seriesRect.x - this.centerX;
        const seriesRight = seriesRect.x + seriesRect.width - this.centerX;
        const seriesTop = seriesRect.y - this.centerY;
        const seriesBottom = seriesRect.y + seriesRect.height - this.centerY;
        const errPx = 1; // Prevents errors related to floating point calculations
        let visibleTextPart = 1;
        if (box.x + errPx < seriesLeft) {
            visibleTextPart = (box.x + box.width - seriesLeft) / box.width;
        }
        else if (box.x + box.width - errPx > seriesRight) {
            visibleTextPart = (seriesRight - box.x) / box.width;
        }
        const hasVerticalOverflow = box.y + errPx < seriesTop || box.y + box.height - errPx > seriesBottom;
        const textLength = Math.floor(text.length * visibleTextPart) - 1;
        const hasSurroundingSeriesOverflow = this.bboxIntersectsSurroundingSeries(box);
        return { visibleTextPart, textLength, hasVerticalOverflow, hasSurroundingSeriesOverflow };
    }
    bboxIntersectsSurroundingSeries(box, dx = 0, dy = 0) {
        const { surroundingRadius } = this;
        if (surroundingRadius == null) {
            return false;
        }
        const corners = [
            { x: box.x + dx, y: box.y + dy },
            { x: box.x + box.width + dx, y: box.y + dy },
            { x: box.x + box.width + dx, y: box.y + box.height + dy },
            { x: box.x + dx, y: box.y + box.height + dy },
        ];
        const sur2 = Math.pow(surroundingRadius, 2);
        return corners.some((corner) => Math.pow(corner.x, 2) + Math.pow(corner.y, 2) > sur2);
    }
    computeCalloutLabelCollisionOffsets() {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const { offset, minSpacing } = calloutLabel;
        const innerRadius = radiusScale.convert(0);
        const shouldSkip = (datum) => {
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            return !label || outerRadius === 0;
        };
        const fullData = this.nodeData;
        const data = this.nodeData.filter((text) => !shouldSkip(text));
        data.forEach((datum) => {
            const label = datum.calloutLabel;
            label.hidden = false;
            label.collisionTextAlign = undefined;
            label.collisionOffsetY = 0;
        });
        if (data.length <= 1) {
            return;
        }
        const leftLabels = data.filter((d) => d.midCos < 0).sort((a, b) => a.midSin - b.midSin);
        const rightLabels = data.filter((d) => d.midCos >= 0).sort((a, b) => a.midSin - b.midSin);
        const topLabels = data
            .filter((d) => d.midSin < 0 && d.calloutLabel.textAlign === 'center')
            .sort((a, b) => a.midCos - b.midCos);
        const bottomLabels = data
            .filter((d) => d.midSin >= 0 && d.calloutLabel.textAlign === 'center')
            .sort((a, b) => a.midCos - b.midCos);
        const tempTextNode = new Text();
        const getTextBBox = (datum) => {
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            const labelRadius = outerRadius + calloutLine.length + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius + label.collisionOffsetY;
            this.setTextDimensionalProps(tempTextNode, x, y, this.calloutLabel, label);
            return tempTextNode.computeBBox();
        };
        const avoidNeighbourYCollision = (label, next, direction) => {
            const box = getTextBBox(label).grow(minSpacing / 2);
            const other = getTextBBox(next).grow(minSpacing / 2);
            // The full collision is not detected, because sometimes
            // the next label can appear behind the label with offset
            const collidesOrBehind = box.x < other.x + other.width &&
                box.x + box.width > other.x &&
                (direction === 'to-top' ? box.y < other.y + other.height : box.y + box.height > other.y);
            if (collidesOrBehind) {
                const dy = direction === 'to-top' ? box.y - other.y - other.height : box.y + box.height - other.y;
                next.calloutLabel.collisionOffsetY = dy;
            }
        };
        const avoidYCollisions = (labels) => {
            const midLabel = labels.slice().sort((a, b) => Math.abs(a.midSin) - Math.abs(b.midSin))[0];
            const midIndex = labels.indexOf(midLabel);
            for (let i = midIndex - 1; i >= 0; i--) {
                const prev = labels[i + 1];
                const next = labels[i];
                avoidNeighbourYCollision(prev, next, 'to-top');
            }
            for (let i = midIndex + 1; i < labels.length; i++) {
                const prev = labels[i - 1];
                const next = labels[i];
                avoidNeighbourYCollision(prev, next, 'to-bottom');
            }
        };
        const avoidXCollisions = (labels) => {
            const labelsCollideLabelsByY = data.some((datum) => datum.calloutLabel.collisionOffsetY !== 0);
            const boxes = labels.map((label) => getTextBBox(label));
            const paddedBoxes = boxes.map((box) => box.clone().grow(minSpacing / 2));
            let labelsCollideLabelsByX = false;
            for (let i = 0; i < paddedBoxes.length && !labelsCollideLabelsByX; i++) {
                const box = paddedBoxes[i];
                for (let j = i + 1; j < labels.length; j++) {
                    const other = paddedBoxes[j];
                    if (box.collidesBBox(other)) {
                        labelsCollideLabelsByX = true;
                        break;
                    }
                }
            }
            const sectors = fullData.map((datum) => {
                const { startAngle, endAngle } = datum;
                const radius = radiusScale.convert(datum.radius);
                const outerRadius = Math.max(0, radius);
                return { startAngle, endAngle, innerRadius, outerRadius };
            });
            const labelsCollideSectors = boxes.some((box) => {
                return sectors.some((sector) => boxCollidesSector(box, sector));
            });
            if (!labelsCollideLabelsByX && !labelsCollideLabelsByY && !labelsCollideSectors) {
                return;
            }
            labels
                .filter((datum) => datum.calloutLabel.textAlign === 'center')
                .forEach((datum) => {
                const label = datum.calloutLabel;
                if (datum.midCos < 0) {
                    label.collisionTextAlign = 'right';
                }
                else if (datum.midCos > 0) {
                    label.collisionTextAlign = 'left';
                }
                else {
                    label.collisionTextAlign = 'center';
                }
            });
        };
        avoidYCollisions(leftLabels);
        avoidYCollisions(rightLabels);
        avoidXCollisions(topLabels);
        avoidXCollisions(bottomLabels);
    }
    updateCalloutLabelNodes(seriesRect) {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, color } = calloutLabel;
        const tempTextNode = new Text();
        this.calloutLabelSelection.selectByTag(PieNodeTag.Label).forEach((text) => {
            const { datum } = text;
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            if (!(label === null || label === void 0 ? void 0 : label.text) || outerRadius === 0 || label.hidden) {
                text.visible = false;
                return;
            }
            const labelRadius = outerRadius + calloutLength + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius + label.collisionOffsetY;
            // Detect text overflow
            this.setTextDimensionalProps(tempTextNode, x, y, this.calloutLabel, label);
            const box = tempTextNode.computeBBox();
            const { visibleTextPart, textLength, hasVerticalOverflow } = this.getLabelOverflow(label.text, box, seriesRect);
            const displayText = visibleTextPart === 1 ? label.text : `${label.text.substring(0, textLength)}…`;
            this.setTextDimensionalProps(text, x, y, this.calloutLabel, Object.assign(Object.assign({}, label), { text: displayText }));
            text.fill = color;
            text.visible = !hasVerticalOverflow;
        });
    }
    computeLabelsBBox(options, seriesRect) {
        var _a;
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, maxCollisionOffset, minSpacing } = calloutLabel;
        this.maybeRefreshNodeData();
        this.updateRadiusScale();
        this.computeCalloutLabelCollisionOffsets();
        const textBoxes = [];
        const text = new Text();
        let titleBox;
        if (((_a = this.title) === null || _a === void 0 ? void 0 : _a.text) && this.title.enabled) {
            const dy = this.getTitleTranslationY();
            if (isFinite(dy)) {
                this.setTextDimensionalProps(text, 0, dy, this.title, {
                    text: this.title.text,
                    textBaseline: 'bottom',
                    textAlign: 'center',
                    hidden: false,
                    collisionTextAlign: undefined,
                    collisionOffsetY: 0,
                });
                titleBox = text.computeBBox();
                textBoxes.push(titleBox);
            }
        }
        this.nodeData.forEach((datum) => {
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            if (!label || outerRadius === 0) {
                return null;
            }
            const labelRadius = outerRadius + calloutLength + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius + label.collisionOffsetY;
            this.setTextDimensionalProps(text, x, y, this.calloutLabel, label);
            const box = text.computeBBox();
            label.box = box;
            // Hide labels that where pushed to far by the collision avoidance algorithm
            if (Math.abs(label.collisionOffsetY) > maxCollisionOffset) {
                label.hidden = true;
                return;
            }
            // Hide labels intersecting or above the title
            if (titleBox) {
                const seriesTop = seriesRect.y - this.centerY;
                const titleCleanArea = new BBox(titleBox.x - minSpacing, seriesTop, titleBox.width + 2 * minSpacing, titleBox.y + titleBox.height + minSpacing - seriesTop);
                if (box.collidesBBox(titleCleanArea)) {
                    label.hidden = true;
                    return;
                }
            }
            if (options.hideWhenNecessary) {
                const { textLength, hasVerticalOverflow, hasSurroundingSeriesOverflow } = this.getLabelOverflow(label.text, box, seriesRect);
                const isTooShort = label.text.length > 2 && textLength < 2;
                if (hasVerticalOverflow || isTooShort || hasSurroundingSeriesOverflow) {
                    label.hidden = true;
                    return;
                }
            }
            label.hidden = false;
            textBoxes.push(box);
        });
        if (textBoxes.length === 0) {
            return null;
        }
        return BBox.merge(textBoxes);
    }
    setTextDimensionalProps(textNode, x, y, style, label) {
        var _a, _b;
        const { fontStyle, fontWeight, fontSize, fontFamily } = style;
        textNode.fontStyle = fontStyle;
        textNode.fontWeight = fontWeight;
        textNode.fontSize = fontSize;
        textNode.fontFamily = fontFamily;
        textNode.text = label.text;
        textNode.x = x;
        textNode.y = y;
        textNode.textAlign = (_b = (_a = label === null || label === void 0 ? void 0 : label.collisionTextAlign) !== null && _a !== void 0 ? _a : label === null || label === void 0 ? void 0 : label.textAlign) !== null && _b !== void 0 ? _b : 'center';
        textNode.textBaseline = label.textBaseline;
    }
    updateSectorLabelNodes() {
        const { radiusScale } = this;
        const innerRadius = radiusScale.convert(0);
        const { fontSize, fontStyle, fontWeight, fontFamily, positionOffset, positionRatio, color } = this.sectorLabel;
        const isDoughnut = innerRadius > 0;
        const singleVisibleSector = this.seriesItemEnabled.filter(Boolean).length === 1;
        this.sectorLabelSelection.each((text, datum) => {
            const sectorLabel = datum.sectorLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            let isTextVisible = false;
            if (sectorLabel && outerRadius !== 0) {
                const labelRadius = innerRadius * (1 - positionRatio) + radius * positionRatio + positionOffset;
                text.fill = color;
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.text = sectorLabel.text;
                const shouldPutTextInCenter = !isDoughnut && singleVisibleSector;
                if (shouldPutTextInCenter) {
                    text.x = 0;
                    text.y = 0;
                }
                else {
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                }
                text.textAlign = 'center';
                text.textBaseline = 'middle';
                const bbox = text.computeBBox();
                const corners = [
                    [bbox.x, bbox.y],
                    [bbox.x + bbox.width, bbox.y],
                    [bbox.x + bbox.width, bbox.y + bbox.height],
                    [bbox.x, bbox.y + bbox.height],
                ];
                const { startAngle, endAngle } = datum;
                const sectorBounds = { startAngle, endAngle, innerRadius, outerRadius };
                if (corners.every(([x, y]) => isPointInSector(x, y, sectorBounds))) {
                    isTextVisible = true;
                }
            }
            text.visible = isTextVisible;
        });
    }
    updateInnerCircle() {
        const circle = this.innerCircleNode;
        if (!circle) {
            return;
        }
        const innerRadius = this.getInnerRadius();
        if (innerRadius === 0) {
            circle.size = 0;
        }
        else {
            const circleRadius = Math.min(innerRadius, this.getOuterRadius());
            const antiAliasingPadding = 1;
            circle.size = Math.ceil(circleRadius * 2 + antiAliasingPadding);
        }
    }
    updateInnerLabelNodes() {
        const textBBoxes = [];
        const margins = [];
        this.innerLabelsSelection.each((text, datum) => {
            const { fontStyle, fontWeight, fontSize, fontFamily, color } = datum;
            text.fontStyle = fontStyle;
            text.fontWeight = fontWeight;
            text.fontSize = fontSize;
            text.fontFamily = fontFamily;
            text.text = datum.text;
            text.x = 0;
            text.y = 0;
            text.fill = color;
            text.textAlign = 'center';
            text.textBaseline = 'alphabetic';
            textBBoxes.push(text.computeBBox());
            margins.push(datum.margin);
        });
        const getMarginTop = (index) => (index === 0 ? 0 : margins[index]);
        const getMarginBottom = (index) => (index === margins.length - 1 ? 0 : margins[index]);
        const totalHeight = textBBoxes.reduce((sum, bbox, i) => {
            return sum + bbox.height + getMarginTop(i) + getMarginBottom(i);
        }, 0);
        const totalWidth = Math.max(...textBBoxes.map((bbox) => bbox.width));
        const innerRadius = this.getInnerRadius();
        const labelRadius = Math.sqrt(Math.pow(totalWidth / 2, 2) + Math.pow(totalHeight / 2, 2));
        const labelsVisible = labelRadius <= (innerRadius > 0 ? innerRadius : this.getOuterRadius());
        const textBottoms = [];
        for (let i = 0, prev = -totalHeight / 2; i < textBBoxes.length; i++) {
            const bbox = textBBoxes[i];
            const bottom = bbox.height + prev + getMarginTop(i);
            textBottoms.push(bottom);
            prev = bottom + getMarginBottom(i);
        }
        this.innerLabelsSelection.each((text, _datum, index) => {
            text.y = textBottoms[index];
            text.visible = labelsVisible;
        });
    }
    getNodeClickEvent(event, datum) {
        return new PieSeriesNodeClickEvent(this.angleKey, this.calloutLabelKey, this.sectorLabelKey, this.radiusKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        return new PieSeriesNodeDoubleClickEvent(this.angleKey, this.calloutLabelKey, this.sectorLabelKey, this.radiusKey, event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
        var _a;
        const { angleKey } = this;
        if (!angleKey) {
            return '';
        }
        const { tooltip, angleName, radiusKey, radiusName, calloutLabelKey, sectorLabelKey, calloutLabelName, sectorLabelName, id: seriesId, } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const { datum, angleValue, radiusValue, sectorFormat: { fill: color }, calloutLabel: { text: label = '' } = {}, } = nodeDatum;
        const formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : String(angleValue);
        const title = (_a = this.title) === null || _a === void 0 ? void 0 : _a.text;
        const content = `${label ? `${label}: ` : ''}${formattedAngleValue}`;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum,
                angleKey,
                angleValue,
                angleName,
                radiusKey,
                radiusValue,
                radiusName,
                calloutLabelKey,
                calloutLabelName,
                sectorLabelKey,
                sectorLabelName,
                title,
                color,
                seriesId,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    getLegendData() {
        var _a, _b, _c;
        const { calloutLabelKey, legendItemKey, id, data } = this;
        if (!data || data.length === 0)
            return [];
        if (!legendItemKey && !calloutLabelKey)
            return [];
        const titleText = ((_a = this.title) === null || _a === void 0 ? void 0 : _a.showInLegend) && this.title.text;
        const legendData = [];
        for (let index = 0; index < data.length; index++) {
            const datum = data[index];
            const labelParts = [];
            if (titleText) {
                labelParts.push(titleText);
            }
            const labels = this.getLabels(datum, 2 * Math.PI, 2 * Math.PI, false);
            if (legendItemKey && labels.legendItem !== undefined) {
                labelParts.push(labels.legendItem.text);
            }
            else if (calloutLabelKey && ((_b = labels.calloutLabel) === null || _b === void 0 ? void 0 : _b.text) !== undefined) {
                labelParts.push((_c = labels.calloutLabel) === null || _c === void 0 ? void 0 : _c.text);
            }
            if (labelParts.length === 0)
                continue;
            const sectorFormat = this.getSectorFormat(datum, index, index, false);
            legendData.push({
                legendType: 'category',
                id,
                itemId: index,
                seriesId: id,
                enabled: this.seriesItemEnabled[index],
                label: {
                    text: labelParts.join(' - '),
                },
                marker: {
                    fill: sectorFormat.fill,
                    stroke: sectorFormat.stroke,
                    fillOpacity: this.fillOpacity,
                    strokeOpacity: this.strokeOpacity,
                },
            });
        }
        return legendData;
    }
    onLegendItemClick(event) {
        const { enabled, itemId, series } = event;
        if (series.id === this.id) {
            this.toggleSeriesItem(itemId, enabled);
        }
        else if (series.type === 'pie') {
            this.toggleOtherSeriesItems(series, itemId, enabled);
        }
    }
    toggleSeriesItem(itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    }
    toggleOtherSeriesItems(series, itemId, enabled) {
        var _a, _b;
        const { legendItemKey } = this;
        if (!legendItemKey)
            return;
        const datumToggledLegendItemValue = series.legendItemKey && ((_a = series.data) === null || _a === void 0 ? void 0 : _a.find((_, index) => index === itemId)[series.legendItemKey]);
        if (!datumToggledLegendItemValue)
            return;
        (_b = this.data) === null || _b === void 0 ? void 0 : _b.forEach((datum, datumItemId) => {
            if (datum[legendItemKey] === datumToggledLegendItemValue) {
                this.toggleSeriesItem(datumItemId, enabled);
            }
        });
    }
    animateEmptyUpdateReady() {
        const duration = 1000;
        const labelDuration = 200;
        const rotation = Math.PI / -2 + toRadians(this.rotation);
        this.groupSelection.selectByTag(PieNodeTag.Sector).forEach((node) => {
            var _a;
            const datum = node.datum;
            (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_empty-update-ready_${node.id}`, [
                { from: rotation, to: datum.startAngle },
                { from: rotation, to: datum.endAngle },
            ], {
                disableInteractions: true,
                duration,
                ease: easing.easeOut,
                repeat: 0,
                onUpdate([startAngle, endAngle]) {
                    node.startAngle = startAngle;
                    node.endAngle = endAngle;
                },
            });
        });
        const labelAnimationOptions = {
            from: 0,
            to: 1,
            delay: duration,
            duration: labelDuration,
            ease: easing.linear,
            repeat: 0,
        };
        this.calloutLabelSelection.each((label) => {
            var _a;
            (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, Object.assign(Object.assign({}, labelAnimationOptions), { onUpdate(opacity) {
                    label.opacity = opacity;
                } }));
        });
        this.sectorLabelSelection.each((label) => {
            var _a;
            (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, Object.assign(Object.assign({}, labelAnimationOptions), { onUpdate(opacity) {
                    label.opacity = opacity;
                } }));
        });
        this.innerLabelsSelection.each((label) => {
            var _a;
            (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, Object.assign(Object.assign({}, labelAnimationOptions), { onUpdate(opacity) {
                    label.opacity = opacity;
                } }));
        });
    }
    animateReadyUpdateReady() {
        this.groupSelection.selectByTag(PieNodeTag.Sector).forEach((node) => {
            const { datum } = node;
            node.startAngle = datum.startAngle;
            node.endAngle = datum.endAngle;
        });
    }
}
PieSeries.className = 'PieSeries';
PieSeries.type = 'pie';
__decorate([
    Validate(STRING)
], PieSeries.prototype, "angleKey", void 0);
__decorate([
    Validate(STRING)
], PieSeries.prototype, "angleName", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "radiusKey", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "radiusName", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], PieSeries.prototype, "radiusMin", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], PieSeries.prototype, "radiusMax", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "calloutLabelKey", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "calloutLabelName", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "sectorLabelKey", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "sectorLabelName", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "legendItemKey", void 0);
__decorate([
    Validate(COLOR_STRING_ARRAY)
], PieSeries.prototype, "fills", void 0);
__decorate([
    Validate(COLOR_STRING_ARRAY)
], PieSeries.prototype, "strokes", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], PieSeries.prototype, "fillOpacity", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], PieSeries.prototype, "strokeOpacity", void 0);
__decorate([
    Validate(OPT_LINE_DASH)
], PieSeries.prototype, "lineDash", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeries.prototype, "lineDashOffset", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], PieSeries.prototype, "formatter", void 0);
__decorate([
    Validate(NUMBER(-360, 360))
], PieSeries.prototype, "rotation", void 0);
__decorate([
    Validate(NUMBER())
], PieSeries.prototype, "outerRadiusOffset", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeries.prototype, "outerRadiusRatio", void 0);
__decorate([
    Validate(NUMBER())
], PieSeries.prototype, "innerRadiusOffset", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeries.prototype, "innerRadiusRatio", void 0);
__decorate([
    Validate(NUMBER(0))
], PieSeries.prototype, "strokeWidth", void 0);
