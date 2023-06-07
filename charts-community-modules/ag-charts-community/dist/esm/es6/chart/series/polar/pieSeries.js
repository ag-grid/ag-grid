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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGllU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9wb2xhci9waWVTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVyRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBRUgsY0FBYyxFQUNkLGFBQWEsRUFDYix3QkFBd0IsRUFDeEIsYUFBYSxFQUNiLG1CQUFtQixFQUNuQix5QkFBeUIsR0FDNUIsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFB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