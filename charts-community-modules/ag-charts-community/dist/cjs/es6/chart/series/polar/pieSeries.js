"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieSeries = exports.DoughnutInnerCircle = exports.DoughnutInnerLabel = exports.PieTitle = void 0;
const group_1 = require("../../../scene/group");
const line_1 = require("../../../scene/shape/line");
const text_1 = require("../../../scene/shape/text");
const circle_1 = require("../../marker/circle");
const selection_1 = require("../../../scene/selection");
const linearScale_1 = require("../../../scale/linearScale");
const sector_1 = require("../../../scene/shape/sector");
const bbox_1 = require("../../../scene/bbox");
const series_1 = require("./../series");
const label_1 = require("../../label");
const node_1 = require("../../../scene/node");
const angle_1 = require("../../../util/angle");
const number_1 = require("../../../util/number");
const layers_1 = require("../../layers");
const caption_1 = require("../../../caption");
const polarSeries_1 = require("./polarSeries");
const chartAxisDirection_1 = require("../../chartAxisDirection");
const tooltip_1 = require("../../tooltip/tooltip");
const sector_2 = require("../../../util/sector");
const validation_1 = require("../../../util/validation");
const states_1 = require("../../../motion/states");
const easing = require("../../../motion/easing");
const processors_1 = require("../../data/processors");
class PieSeriesNodeBaseClickEvent extends series_1.SeriesNodeBaseClickEvent {
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
class PieSeriesCalloutLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.offset = 3; // from the callout line
        this.minAngle = 0; // in degrees
        this.formatter = undefined;
        this.minSpacing = 4;
        this.maxCollisionOffset = 50;
        this.avoidCollisions = true;
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCalloutLabel.prototype, "offset", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCalloutLabel.prototype, "minAngle", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], PieSeriesCalloutLabel.prototype, "formatter", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCalloutLabel.prototype, "minSpacing", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCalloutLabel.prototype, "maxCollisionOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], PieSeriesCalloutLabel.prototype, "avoidCollisions", void 0);
class PieSeriesSectorLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.positionOffset = 0;
        this.positionRatio = 0.5;
        this.formatter = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER())
], PieSeriesSectorLabel.prototype, "positionOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], PieSeriesSectorLabel.prototype, "positionRatio", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], PieSeriesSectorLabel.prototype, "formatter", void 0);
class PieSeriesCalloutLine {
    constructor() {
        this.colors = undefined;
        this.length = 10;
        this.strokeWidth = 1;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING_ARRAY)
], PieSeriesCalloutLine.prototype, "colors", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCalloutLine.prototype, "length", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCalloutLine.prototype, "strokeWidth", void 0);
class PieSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], PieSeriesTooltip.prototype, "renderer", void 0);
class PieTitle extends caption_1.Caption {
    constructor() {
        super(...arguments);
        this.showInLegend = false;
    }
}
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], PieTitle.prototype, "showInLegend", void 0);
exports.PieTitle = PieTitle;
class DoughnutInnerLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.text = '';
        this.margin = 2;
    }
}
__decorate([
    validation_1.Validate(validation_1.STRING)
], DoughnutInnerLabel.prototype, "text", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER())
], DoughnutInnerLabel.prototype, "margin", void 0);
exports.DoughnutInnerLabel = DoughnutInnerLabel;
class DoughnutInnerCircle {
    constructor() {
        this.fill = 'transparent';
        this.fillOpacity = 1;
    }
}
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING)
], DoughnutInnerCircle.prototype, "fill", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
], DoughnutInnerCircle.prototype, "fillOpacity", void 0);
exports.DoughnutInnerCircle = DoughnutInnerCircle;
class PieStateMachine extends states_1.StateMachine {
}
class PieSeries extends polarSeries_1.PolarSeries {
    constructor(moduleCtx) {
        var _a, _b, _c;
        super({ moduleCtx, useLabelLayer: true });
        this.radiusScale = new linearScale_1.LinearScale();
        this.groupSelection = selection_1.Selection.select(this.contentGroup, group_1.Group);
        this.highlightSelection = selection_1.Selection.select(this.highlightGroup, group_1.Group);
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
        this.highlightStyle = new series_1.HighlightStyle();
        this.surroundingRadius = undefined;
        this.angleScale = new linearScale_1.LinearScale();
        // Each sector is a ratio of the whole, where all ratios add up to 1.
        this.angleScale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        this.angleScale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
        this.backgroundGroup = this.rootGroup.appendChild(new group_1.Group({
            name: `${this.id}-background`,
            layer: true,
            zIndex: layers_1.Layers.SERIES_BACKGROUND_ZINDEX,
        }));
        const pieCalloutLabels = new group_1.Group({ name: 'pieCalloutLabels' });
        const pieSectorLabels = new group_1.Group({ name: 'pieSectorLabels' });
        const innerLabels = new group_1.Group({ name: 'innerLabels' });
        (_a = this.labelGroup) === null || _a === void 0 ? void 0 : _a.append(pieCalloutLabels);
        (_b = this.labelGroup) === null || _b === void 0 ? void 0 : _b.append(pieSectorLabels);
        (_c = this.labelGroup) === null || _c === void 0 ? void 0 : _c.append(innerLabels);
        this.calloutLabelSelection = selection_1.Selection.select(pieCalloutLabels, group_1.Group);
        this.sectorLabelSelection = selection_1.Selection.select(pieSectorLabels, text_1.Text);
        this.innerLabelsSelection = selection_1.Selection.select(innerLabels, text_1.Text);
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
        (_a = this.ctx.chartEventManager) === null || _a === void 0 ? void 0 : _a.addListener('legend-item-click', (event) => this.onLegendItemClick(event));
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
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            return this.angleScale.domain;
        }
        else {
            return this.radiusScale.domain;
        }
    }
    processData(dataController) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let { data = [] } = this;
            const { angleKey, radiusKey, calloutLabelKey, sectorLabelKey, legendItemKey, seriesItemEnabled } = this;
            if (!angleKey)
                return;
            const extraProps = [];
            if (radiusKey) {
                extraProps.push(series_1.rangedValueProperty(this, radiusKey, {
                    id: 'radiusValue',
                    min: (_a = this.radiusMin) !== null && _a !== void 0 ? _a : 0,
                    max: this.radiusMax,
                }), series_1.valueProperty(this, radiusKey, true, { id: `radiusRaw` }), // Raw value pass-through.
                processors_1.normalisePropertyTo(this, { id: 'radiusValue' }, [0, 1], (_b = this.radiusMin) !== null && _b !== void 0 ? _b : 0, this.radiusMax));
                extraProps.push();
            }
            if (calloutLabelKey) {
                extraProps.push(series_1.valueProperty(this, calloutLabelKey, false, { id: `calloutLabelValue` }));
            }
            if (sectorLabelKey) {
                extraProps.push(series_1.valueProperty(this, sectorLabelKey, false, { id: `sectorLabelValue` }));
            }
            if (legendItemKey) {
                extraProps.push(series_1.valueProperty(this, legendItemKey, false, { id: `legendItemValue` }));
            }
            data = data.map((d, idx) => (seriesItemEnabled[idx] ? d : Object.assign(Object.assign({}, d), { [angleKey]: 0 })));
            const { dataModel, processedData } = yield dataController.request(this.id, data, {
                props: [
                    series_1.accumulativeValueProperty(this, angleKey, true, { id: `angleValue` }),
                    series_1.valueProperty(this, angleKey, true, { id: `angleRaw` }),
                    processors_1.normalisePropertyTo(this, { id: 'angleValue' }, [0, 1], 0),
                    ...extraProps,
                ],
            });
            this.dataModel = dataModel;
            this.processedData = processedData;
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
    getProcessedDataIndexes(dataModel) {
        const angleIdx = dataModel.resolveProcessedDataIndexById(this, `angleValue`).index;
        const radiusIdx = this.radiusKey ? dataModel.resolveProcessedDataIndexById(this, `radiusValue`).index : -1;
        const calloutLabelIdx = this.calloutLabelKey
            ? dataModel.resolveProcessedDataIndexById(this, `calloutLabelValue`).index
            : -1;
        const sectorLabelIdx = this.sectorLabelKey
            ? dataModel.resolveProcessedDataIndexById(this, `sectorLabelValue`).index
            : -1;
        const legendItemIdx = this.legendItemKey
            ? dataModel.resolveProcessedDataIndexById(this, `legendItemValue`).index
            : -1;
        return { angleIdx, radiusIdx, calloutLabelIdx, sectorLabelIdx, legendItemIdx };
    }
    _createNodeData() {
        const { id: seriesId, processedData, dataModel, rotation, angleScale } = this;
        if (!processedData || !dataModel || processedData.type !== 'ungrouped')
            return [];
        const { angleIdx, radiusIdx, calloutLabelIdx, sectorLabelIdx, legendItemIdx } = this.getProcessedDataIndexes(dataModel);
        let currentStart = 0;
        const nodeData = processedData.data.map((group, index) => {
            var _a;
            const { datum, values } = group;
            const currentValue = values[angleIdx];
            const startAngle = angleScale.convert(currentStart) + angle_1.toRadians(rotation);
            currentStart = currentValue;
            const endAngle = angleScale.convert(currentStart) + angle_1.toRadians(rotation);
            const span = Math.abs(endAngle - startAngle);
            const midAngle = startAngle + span / 2;
            const angleValue = values[angleIdx + 1];
            const radius = radiusIdx >= 0 ? (_a = values[radiusIdx]) !== null && _a !== void 0 ? _a : 1 : 1;
            const radiusValue = radiusIdx >= 0 ? values[radiusIdx + 1] : undefined;
            const legendItemValue = legendItemIdx >= 0 ? values[legendItemIdx] : undefined;
            const labels = this.getLabels(datum, midAngle, span, true, currentValue, radiusValue, values[calloutLabelIdx], values[sectorLabelIdx], legendItemValue);
            const sectorFormat = this.getSectorFormat(datum, index, index, false);
            return Object.assign({ itemId: index, series: this, datum,
                index,
                angleValue,
                midAngle, midCos: Math.cos(midAngle), midSin: Math.sin(midAngle), startAngle,
                endAngle,
                sectorFormat,
                radius,
                radiusValue,
                legendItemValue }, labels);
        });
        return [
            {
                itemId: seriesId,
                nodeData,
                labelData: nodeData,
            },
        ];
    }
    getLabels(datum, midAngle, span, skipDisabled, angleValue, radiusValue, calloutLabelValue, sectorLabelValue, legendItemValue) {
        const { calloutLabel, sectorLabel, legendItemKey, ctx: { callbackCache }, } = this;
        const calloutLabelKey = !skipDisabled || calloutLabel.enabled ? this.calloutLabelKey : undefined;
        const sectorLabelKey = !skipDisabled || sectorLabel.enabled ? this.sectorLabelKey : undefined;
        if (!calloutLabelKey && !sectorLabelKey && !legendItemKey)
            return {};
        const labelFormatterParams = this.getLabelFormatterParams(datum, angleValue, radiusValue, calloutLabelValue, sectorLabelValue);
        let calloutLabelText;
        if (calloutLabelKey) {
            const calloutLabelMinAngle = angle_1.toRadians(calloutLabel.minAngle);
            const calloutLabelVisible = span > calloutLabelMinAngle;
            if (!calloutLabelVisible) {
                calloutLabelText = undefined;
            }
            else if (calloutLabel.formatter) {
                calloutLabelText = callbackCache.call(calloutLabel.formatter, labelFormatterParams);
            }
            else {
                calloutLabelText = String(calloutLabelValue);
            }
        }
        let sectorLabelText;
        if (sectorLabelKey) {
            if (sectorLabel.formatter) {
                sectorLabelText = callbackCache.call(sectorLabel.formatter, labelFormatterParams);
            }
            else {
                sectorLabelText = String(sectorLabelValue);
            }
        }
        return Object.assign(Object.assign(Object.assign({}, (calloutLabelText != null
            ? {
                calloutLabel: Object.assign(Object.assign({}, this.getTextAlignment(midAngle)), { text: calloutLabelText, hidden: false, collisionTextAlign: undefined, collisionOffsetY: 0, box: undefined }),
            }
            : {})), (sectorLabelText != null ? { sectorLabel: { text: sectorLabelText } } : {})), (legendItemKey != null && legendItemValue != null
            ? { legendItem: { key: legendItemKey, text: legendItemValue } }
            : {}));
    }
    getLabelFormatterParams(datum, angleValue, radiusValue, calloutLabelValue, sectorLabelValue) {
        const { id: seriesId, radiusKey, radiusName, angleKey, angleName, calloutLabelKey, calloutLabelName, sectorLabelKey, sectorLabelName, } = this;
        return {
            datum,
            angleKey,
            angleValue,
            angleName,
            radiusKey,
            radiusValue,
            radiusName,
            calloutLabelKey,
            calloutLabelValue,
            calloutLabelName,
            sectorLabelKey,
            sectorLabelValue,
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
        const midAngle180 = angle_1.normalizeAngle180(midAngle);
        // Split the circle into quadrants like so: ⊗
        const quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
        const quadrantOffset = midAngle180 - quadrantStart;
        const quadrant = Math.floor(quadrantOffset / (Math.PI / 2));
        const quadrantIndex = number_1.mod(quadrant, quadrantTextOpts.length);
        return quadrantTextOpts[quadrantIndex];
    }
    getSectorFormat(datum, itemId, index, highlight) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { angleKey, radiusKey, fills, strokes, fillOpacity: seriesFillOpacity, formatter, id: seriesId, ctx: { callbackCache, highlightManager }, } = this;
        const highlightedDatum = highlightManager === null || highlightManager === void 0 ? void 0 : highlightManager.getActiveHighlight();
        const isDatumHighlighted = highlight && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this && itemId === highlightedDatum.itemId;
        const highlightedStyle = isDatumHighlighted ? this.highlightStyle.item : null;
        const fill = (_a = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fill) !== null && _a !== void 0 ? _a : fills[index % fills.length];
        const fillOpacity = (_b = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fillOpacity) !== null && _b !== void 0 ? _b : seriesFillOpacity;
        const stroke = (_c = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.stroke) !== null && _c !== void 0 ? _c : strokes[index % strokes.length];
        const strokeWidth = (_d = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.strokeWidth) !== null && _d !== void 0 ? _d : this.getStrokeWidth(this.strokeWidth);
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
            fill: (_e = format === null || format === void 0 ? void 0 : format.fill) !== null && _e !== void 0 ? _e : fill,
            fillOpacity: (_f = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _f !== void 0 ? _f : fillOpacity,
            stroke: (_g = format === null || format === void 0 ? void 0 : format.stroke) !== null && _g !== void 0 ? _g : stroke,
            strokeWidth: (_h = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _h !== void 0 ? _h : strokeWidth,
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
            this.contentGroup.translationX = this.centerX;
            this.contentGroup.translationY = this.centerY;
            this.highlightGroup.translationX = this.centerX;
            this.highlightGroup.translationY = this.centerY;
            this.backgroundGroup.translationX = this.centerX;
            this.backgroundGroup.translationY = this.centerY;
            if (this.labelGroup) {
                this.labelGroup.translationX = this.centerX;
                this.labelGroup.translationY = this.centerY;
            }
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
                circle = new circle_1.Circle();
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
                    const sector = new sector_1.Sector();
                    sector.tag = PieNodeTag.Sector;
                    group.appendChild(sector);
                });
            };
            this.groupSelection = update(groupSelection);
            this.highlightSelection = update(highlightSelection);
            calloutLabelSelection.update(this.nodeData, (group) => {
                const line = new line_1.Line();
                line.tag = PieNodeTag.Callout;
                line.pointerEvents = node_1.PointerEvents.None;
                group.appendChild(line);
                const text = new text_1.Text();
                text.tag = PieNodeTag.Label;
                text.pointerEvents = node_1.PointerEvents.None;
                group.appendChild(text);
            });
            sectorLabelSelection.update(this.nodeData, (node) => {
                node.pointerEvents = node_1.PointerEvents.None;
            });
            innerLabelsSelection.update(this.innerLabels, (node) => {
                node.pointerEvents = node_1.PointerEvents.None;
            });
        });
    }
    updateNodes(seriesRect) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const highlightedDatum = (_a = this.ctx.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
            const isVisible = this.seriesItemEnabled.indexOf(true) >= 0;
            this.rootGroup.visible = isVisible;
            this.backgroundGroup.visible = isVisible;
            this.contentGroup.visible = isVisible;
            this.highlightGroup.visible = isVisible && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this;
            if (this.labelGroup) {
                this.labelGroup.visible = isVisible;
            }
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
                if (isDatumHighlighted) {
                    updateSectorFn(node, node.datum, index, isDatumHighlighted);
                }
                else {
                    node.visible = false;
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
                const isMoved = label.collisionTextAlign || label.collisionOffsetY !== 0;
                if (isMoved && label.box != null) {
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
        const textLength = visibleTextPart === 1 ? text.length : Math.floor(text.length * visibleTextPart) - 1;
        const hasSurroundingSeriesOverflow = this.bboxIntersectsSurroundingSeries(box);
        return { textLength, hasVerticalOverflow, hasSurroundingSeriesOverflow };
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
        const data = this.nodeData.filter((t) => !shouldSkip(t));
        data.forEach((datum) => {
            const label = datum.calloutLabel;
            if (label == null)
                return;
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
            .filter((d) => { var _a; return d.midSin < 0 && ((_a = d.calloutLabel) === null || _a === void 0 ? void 0 : _a.textAlign) === 'center'; })
            .sort((a, b) => a.midCos - b.midCos);
        const bottomLabels = data
            .filter((d) => { var _a; return d.midSin >= 0 && ((_a = d.calloutLabel) === null || _a === void 0 ? void 0 : _a.textAlign) === 'center'; })
            .sort((a, b) => a.midCos - b.midCos);
        const tempTextNode = new text_1.Text();
        const getTextBBox = (datum) => {
            var _a;
            const label = datum.calloutLabel;
            if (label == null)
                return new bbox_1.BBox(0, 0, 0, 0);
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            const labelRadius = outerRadius + calloutLine.length + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius + label.collisionOffsetY;
            tempTextNode.text = label.text;
            tempTextNode.x = x;
            tempTextNode.y = y;
            tempTextNode.setFont(this.calloutLabel);
            tempTextNode.setAlign({
                textAlign: (_a = label.collisionTextAlign) !== null && _a !== void 0 ? _a : label.textAlign,
                textBaseline: label.textBaseline,
            });
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
                return sectors.some((sector) => sector_2.boxCollidesSector(box, sector));
            });
            if (!labelsCollideLabelsByX && !labelsCollideLabelsByY && !labelsCollideSectors) {
                return;
            }
            labels
                .filter((d) => d.calloutLabel.textAlign === 'center')
                .forEach((d) => {
                const label = d.calloutLabel;
                if (d.midCos < 0) {
                    label.collisionTextAlign = 'right';
                }
                else if (d.midCos > 0) {
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
        const tempTextNode = new text_1.Text();
        this.calloutLabelSelection.selectByTag(PieNodeTag.Label).forEach((text) => {
            var _a;
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
            const align = { textAlign: (_a = label.collisionTextAlign) !== null && _a !== void 0 ? _a : label.textAlign, textBaseline: label.textBaseline };
            tempTextNode.text = label.text;
            tempTextNode.x = x;
            tempTextNode.y = y;
            tempTextNode.setFont(this.calloutLabel);
            tempTextNode.setAlign(align);
            const box = tempTextNode.computeBBox();
            let displayText = label.text;
            let visible = true;
            if (calloutLabel.avoidCollisions) {
                const { textLength, hasVerticalOverflow } = this.getLabelOverflow(label.text, box, seriesRect);
                displayText = label.text.length === textLength ? label.text : `${label.text.substring(0, textLength)}…`;
                visible = !hasVerticalOverflow;
            }
            text.text = displayText;
            text.x = x;
            text.y = y;
            text.setFont(this.calloutLabel);
            text.setAlign(align);
            text.fill = color;
            text.visible = visible;
        });
    }
    computeLabelsBBox(options, seriesRect) {
        var _a;
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, maxCollisionOffset, minSpacing } = calloutLabel;
        if (!calloutLabel.avoidCollisions) {
            return null;
        }
        this.maybeRefreshNodeData();
        this.updateRadiusScale();
        this.computeCalloutLabelCollisionOffsets();
        const textBoxes = [];
        const text = new text_1.Text();
        let titleBox;
        if (((_a = this.title) === null || _a === void 0 ? void 0 : _a.text) && this.title.enabled) {
            const dy = this.getTitleTranslationY();
            if (isFinite(dy)) {
                text.text = this.title.text;
                text.x = 0;
                text.y = dy;
                text.setFont(this.title);
                text.setAlign({
                    textBaseline: 'bottom',
                    textAlign: 'center',
                });
                titleBox = text.computeBBox();
                textBoxes.push(titleBox);
            }
        }
        this.nodeData.forEach((datum) => {
            var _a;
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            if (!label || outerRadius === 0) {
                return null;
            }
            const labelRadius = outerRadius + calloutLength + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius + label.collisionOffsetY;
            text.text = label.text;
            text.x = x;
            text.y = y;
            text.setFont(this.calloutLabel);
            text.setAlign({ textAlign: (_a = label.collisionTextAlign) !== null && _a !== void 0 ? _a : label.textAlign, textBaseline: label.textBaseline });
            const box = text.computeBBox();
            label.box = box;
            // Hide labels that where pushed too far by the collision avoidance algorithm
            if (Math.abs(label.collisionOffsetY) > maxCollisionOffset) {
                label.hidden = true;
                return;
            }
            // Hide labels intersecting or above the title
            if (titleBox) {
                const seriesTop = seriesRect.y - this.centerY;
                const titleCleanArea = new bbox_1.BBox(titleBox.x - minSpacing, seriesTop, titleBox.width + 2 * minSpacing, titleBox.y + titleBox.height + minSpacing - seriesTop);
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
        return bbox_1.BBox.merge(textBoxes);
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
                if (corners.every(([x, y]) => sector_2.isPointInSector(x, y, sectorBounds))) {
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
        const formattedAngleValue = typeof angleValue === 'number' ? number_1.toFixed(angleValue) : String(angleValue);
        const title = (_a = this.title) === null || _a === void 0 ? void 0 : _a.text;
        const content = `${label ? `${label}: ` : ''}${formattedAngleValue}`;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
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
        return tooltip_1.toTooltipHtml(defaults);
    }
    getLegendData() {
        var _a, _b, _c;
        const { processedData, calloutLabelKey, legendItemKey, id, dataModel } = this;
        if (!dataModel || !processedData || processedData.data.length === 0)
            return [];
        if (!legendItemKey && !calloutLabelKey)
            return [];
        const { angleIdx, radiusIdx, calloutLabelIdx, sectorLabelIdx, legendItemIdx } = this.getProcessedDataIndexes(dataModel);
        const titleText = ((_a = this.title) === null || _a === void 0 ? void 0 : _a.showInLegend) && this.title.text;
        const legendData = [];
        for (let index = 0; index < processedData.data.length; index++) {
            const { datum, values } = processedData.data[index];
            const labelParts = [];
            if (titleText) {
                labelParts.push(titleText);
            }
            const labels = this.getLabels(datum, 2 * Math.PI, 2 * Math.PI, false, values[angleIdx], values[radiusIdx], values[calloutLabelIdx], values[sectorLabelIdx], values[legendItemIdx]);
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
        const { legendItemKey, dataModel } = this;
        if (!legendItemKey || !dataModel)
            return;
        const datumToggledLegendItemValue = series.legendItemKey && ((_a = series.data) === null || _a === void 0 ? void 0 : _a.find((_, index) => index === itemId)[series.legendItemKey]);
        if (!datumToggledLegendItemValue)
            return;
        const legendItemIdx = dataModel.resolveProcessedDataIndexById(this, `legendItemValue`).index;
        (_b = this.processedData) === null || _b === void 0 ? void 0 : _b.data.forEach(({ values }, datumItemId) => {
            if (values[legendItemIdx] === datumToggledLegendItemValue) {
                this.toggleSeriesItem(datumItemId, enabled);
            }
        });
    }
    animateEmptyUpdateReady() {
        var _a, _b;
        const duration = (_b = (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.defaultOptions.duration) !== null && _b !== void 0 ? _b : 1000;
        const labelDuration = 200;
        const rotation = Math.PI / -2 + angle_1.toRadians(this.rotation);
        this.groupSelection.selectByTag(PieNodeTag.Sector).forEach((node) => {
            var _a;
            const datum = node.datum;
            (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_empty-update-ready_${node.id}`, [
                { from: rotation, to: datum.startAngle },
                { from: rotation, to: datum.endAngle },
            ], {
                duration,
                ease: easing.easeOut,
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
        };
        this.calloutLabelSelection.each((label) => {
            var _a;
            (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, Object.assign(Object.assign({}, labelAnimationOptions), { onUpdate(opacity) {
                    label.opacity = opacity;
                } }));
        });
        this.sectorLabelSelection.each((label) => {
            var _a;
            (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, Object.assign(Object.assign({}, labelAnimationOptions), { onUpdate(opacity) {
                    label.opacity = opacity;
                } }));
        });
        this.innerLabelsSelection.each((label) => {
            var _a;
            (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, Object.assign(Object.assign({}, labelAnimationOptions), { onUpdate(opacity) {
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
    validation_1.Validate(validation_1.STRING)
], PieSeries.prototype, "angleKey", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], PieSeries.prototype, "angleName", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "radiusKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "radiusName", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], PieSeries.prototype, "radiusMin", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], PieSeries.prototype, "radiusMax", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "calloutLabelKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "calloutLabelName", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "sectorLabelKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "sectorLabelName", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "legendItemKey", void 0);
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], PieSeries.prototype, "fills", void 0);
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], PieSeries.prototype, "strokes", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], PieSeries.prototype, "fillOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], PieSeries.prototype, "strokeOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_LINE_DASH)
], PieSeries.prototype, "lineDash", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeries.prototype, "lineDashOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], PieSeries.prototype, "formatter", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(-360, 360))
], PieSeries.prototype, "rotation", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER())
], PieSeries.prototype, "outerRadiusOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeries.prototype, "outerRadiusRatio", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER())
], PieSeries.prototype, "innerRadiusOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeries.prototype, "innerRadiusRatio", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeries.prototype, "strokeWidth", void 0);
exports.PieSeries = PieSeries;
