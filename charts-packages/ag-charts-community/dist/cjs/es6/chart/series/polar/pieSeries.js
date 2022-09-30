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
const group_1 = require("../../../scene/group");
const line_1 = require("../../../scene/shape/line");
const text_1 = require("../../../scene/shape/text");
const circle_1 = require("../../marker/circle");
const selection_1 = require("../../../scene/selection");
const linearScale_1 = require("../../../scale/linearScale");
const continuousScale_1 = require("../../../scale/continuousScale");
const sector_1 = require("../../../scene/shape/sector");
const series_1 = require("./../series");
const label_1 = require("../../label");
const node_1 = require("../../../scene/node");
const angle_1 = require("../../../util/angle");
const function_1 = require("../../../util/function");
const number_1 = require("../../../util/number");
const caption_1 = require("../../../caption");
const observable_1 = require("../../../util/observable");
const polarSeries_1 = require("./polarSeries");
const chartAxis_1 = require("../../chartAxis");
const chart_1 = require("../../chart");
const validation_1 = require("../../../util/validation");
class PieHighlightStyle extends series_1.HighlightStyle {
}
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], PieHighlightStyle.prototype, "centerOffset", void 0);
var PieNodeTag;
(function (PieNodeTag) {
    PieNodeTag[PieNodeTag["Sector"] = 0] = "Sector";
    PieNodeTag[PieNodeTag["Callout"] = 1] = "Callout";
    PieNodeTag[PieNodeTag["Label"] = 2] = "Label";
})(PieNodeTag || (PieNodeTag = {}));
class PieSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.offset = 3; // from the callout line
        this.minAngle = 20; // in degrees
        this.formatter = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesLabel.prototype, "offset", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesLabel.prototype, "minAngle", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], PieSeriesLabel.prototype, "formatter", void 0);
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
class PieSeriesCallout extends observable_1.Observable {
    constructor() {
        super(...arguments);
        this.colors = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        this.length = 10;
        this.strokeWidth = 1;
    }
}
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], PieSeriesCallout.prototype, "colors", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCallout.prototype, "length", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], PieSeriesCallout.prototype, "strokeWidth", void 0);
class PieSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], PieSeriesTooltip.prototype, "renderer", void 0);
exports.PieSeriesTooltip = PieSeriesTooltip;
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
function isPointInArc(x, y, sector) {
    const radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    const { innerRadius, outerRadius } = sector;
    if (radius < Math.min(innerRadius, outerRadius) || radius > Math.max(innerRadius, outerRadius)) {
        return false;
    }
    // Start and End angles are expected to be [-90, 270]
    // while Math.atan2 returns [-180, 180]
    let angle = Math.atan2(y, x);
    if (angle < -Math.PI / 2) {
        angle += 2 * Math.PI;
    }
    // Start is actually bigger than End clock-wise
    const { startAngle, endAngle } = sector;
    if (endAngle === -Math.PI / 2) {
        return angle < startAngle;
    }
    if (startAngle === (3 * Math.PI) / 2) {
        return angle > endAngle;
    }
    return angle >= endAngle && angle <= startAngle;
}
class PieSeries extends polarSeries_1.PolarSeries {
    constructor() {
        super({ useLabelLayer: true });
        this.radiusScale = new linearScale_1.LinearScale();
        this.groupSelection = selection_1.Selection.select(this.pickGroup).selectAll();
        this.highlightSelection = selection_1.Selection.select(this.highlightGroup).selectAll();
        /**
         * The processed data that gets visualized.
         */
        this.groupSelectionData = [];
        this.angleScale = (() => {
            const scale = new linearScale_1.LinearScale();
            // Each sector is a ratio of the whole, where all ratios add up to 1.
            scale.domain = [0, 1];
            // Add 90 deg to start the first pie at 12 o'clock.
            scale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
            return scale;
        })();
        // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
        this.seriesItemEnabled = [];
        this.label = new PieSeriesLabel();
        this.sectorLabel = new PieSeriesSectorLabel();
        this.callout = new PieSeriesCallout();
        this.tooltip = new PieSeriesTooltip();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie sector angle).
         */
        this.angleKey = '';
        this.angleName = '';
        this.innerLabels = [];
        /**
         * The key of the numeric field to use to determine the radii of pie sectors.
         * The largest value will correspond to the full radius and smaller values to
         * proportionally smaller radii.
         */
        this.radiusKey = undefined;
        this.radiusName = undefined;
        this.radiusMin = undefined;
        this.radiusMax = undefined;
        this.labelKey = undefined;
        this.labelName = undefined;
        this.sectorLabelKey = undefined;
        this.sectorLabelName = undefined;
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
        this.highlightStyle = new PieHighlightStyle();
        this.datumSectorRefs = new WeakMap();
        const pieLabels = new group_1.Group();
        const pieSectorLabels = new group_1.Group();
        const innerLabels = new group_1.Group();
        this.labelGroup.append(pieLabels);
        this.labelGroup.append(pieSectorLabels);
        this.labelGroup.append(innerLabels);
        this.labelSelection = selection_1.Selection.select(pieLabels).selectAll();
        this.sectorLabelSelection = selection_1.Selection.select(pieSectorLabels).selectAll();
        this.innerLabelsSelection = selection_1.Selection.select(innerLabels).selectAll();
    }
    set title(value) {
        var _a, _b;
        const oldTitle = this._title;
        if (oldTitle !== value) {
            if (oldTitle) {
                (_a = this.labelGroup) === null || _a === void 0 ? void 0 : _a.removeChild(oldTitle.node);
            }
            if (value) {
                value.node.textBaseline = 'bottom';
                (_b = this.labelGroup) === null || _b === void 0 ? void 0 : _b.appendChild(value.node);
            }
            this._title = value;
        }
    }
    get title() {
        return this._title;
    }
    set data(input) {
        this._data = input;
        this.processSeriesItemEnabled();
    }
    get data() {
        return this._data;
    }
    get innerCircle() {
        return this._innerCircleConfig;
    }
    set innerCircle(value) {
        var _a;
        const oldCircleCfg = this._innerCircleConfig;
        if (oldCircleCfg !== value) {
            const oldNode = this._innerCircleNode;
            let circle;
            if (oldNode) {
                this.backgroundGroup.removeChild(oldNode);
            }
            if (value) {
                circle = new circle_1.Circle();
                circle.fill = value.fill;
                circle.fillOpacity = (_a = value.fillOpacity, (_a !== null && _a !== void 0 ? _a : 1));
                this.backgroundGroup.appendChild(circle);
            }
            this._innerCircleConfig = value;
            this._innerCircleNode = circle;
        }
    }
    visibleChanged() {
        this.processSeriesItemEnabled();
    }
    processSeriesItemEnabled() {
        var _a;
        const { data, visible } = this;
        this.seriesItemEnabled = ((_a = data) === null || _a === void 0 ? void 0 : _a.map(() => visible)) || [];
    }
    setColors(fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
        this.callout.colors = strokes;
    }
    getDomain(direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.angleScale.domain;
        }
        else {
            return this.radiusScale.domain;
        }
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { angleKey, radiusKey, seriesItemEnabled, angleScale, groupSelectionData, label, sectorLabel } = this;
            const data = angleKey && this.data ? this.data : [];
            const angleData = data.map((datum, index) => (seriesItemEnabled[index] && Math.abs(+datum[angleKey])) || 0);
            const angleDataTotal = angleData.reduce((a, b) => a + b, 0);
            // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie sector.
            // Each sector starts where the previous one ends, so we only keep the ratios for end angles.
            const angleDataRatios = (() => {
                let sum = 0;
                return angleData.map((datum) => (sum += datum / angleDataTotal));
            })();
            const labelFormatter = label.formatter;
            const labelKey = label.enabled ? this.labelKey : undefined;
            const sectorLabelKey = sectorLabel.enabled ? this.sectorLabelKey : undefined;
            let labelData = [];
            let sectorLabelData = [];
            let radiusData = [];
            const getLabelFormatterParams = (datum) => {
                return {
                    datum,
                    angleKey,
                    angleValue: datum[angleKey],
                    angleName: this.angleName,
                    radiusKey,
                    radiusValue: radiusKey ? datum[radiusKey] : undefined,
                    radiusName: this.radiusName,
                    labelKey,
                    labelValue: labelKey ? datum[labelKey] : undefined,
                    labelName: this.labelName,
                    sectorLabelKey,
                    sectorLabelValue: sectorLabelKey ? datum[sectorLabelKey] : undefined,
                };
            };
            if (labelKey) {
                if (labelFormatter) {
                    const showValueDeprecationWarning = () => function_1.doOnce(() => console.warn('AG Charts - the use of { value } in the pie chart label formatter function is deprecated. Please use { datum, labelKey, ... } instead.'), 'deprecated use of "value" property in pie chart label formatter');
                    labelData = data.map((datum) => {
                        let deprecatedValue = datum[labelKey];
                        const formatterParams = Object.assign(Object.assign({}, getLabelFormatterParams(datum)), { get value() {
                                showValueDeprecationWarning();
                                return deprecatedValue;
                            },
                            set value(v) {
                                showValueDeprecationWarning();
                                deprecatedValue = v;
                            } });
                        return labelFormatter(formatterParams);
                    });
                }
                else {
                    labelData = data.map((datum) => String(datum[labelKey]));
                }
            }
            const sectorLabelFormatter = sectorLabel.formatter;
            if (sectorLabelKey) {
                if (sectorLabelFormatter) {
                    sectorLabelData = data.map((datum) => {
                        const formatterParams = getLabelFormatterParams(datum);
                        return sectorLabelFormatter(formatterParams);
                    });
                }
                else {
                    sectorLabelData = data.map((datum) => String(datum[sectorLabelKey]));
                }
            }
            if (radiusKey) {
                const { radiusMin, radiusMax } = this;
                const radii = data.map((datum) => Math.abs(datum[radiusKey]));
                const min = (radiusMin !== null && radiusMin !== void 0 ? radiusMin : 0);
                const max = radiusMax ? radiusMax : Math.max(...radii);
                const delta = max - min;
                radiusData = radii.map((value) => (delta ? (value - min) / delta : 1));
            }
            groupSelectionData.length = 0;
            const rotation = angle_1.toRadians(this.rotation);
            const halfPi = Math.PI / 2;
            let datumIndex = 0;
            const quadrantTextOpts = [
                { textAlign: 'center', textBaseline: 'bottom' },
                { textAlign: 'left', textBaseline: 'middle' },
                { textAlign: 'center', textBaseline: 'hanging' },
                { textAlign: 'right', textBaseline: 'middle' },
            ];
            // Process sectors.
            let end = 0;
            angleDataRatios.forEach((start) => {
                if (isNaN(start)) {
                    return;
                } // No sectors displayed - nothing to do.
                const radius = radiusKey ? radiusData[datumIndex] : 1;
                const startAngle = angleScale.convert(start) + rotation;
                const endAngle = angleScale.convert(end) + rotation;
                const midAngle = (startAngle + endAngle) / 2;
                const span = Math.abs(endAngle - startAngle);
                const midCos = Math.cos(midAngle);
                const midSin = Math.sin(midAngle);
                const labelMinAngle = angle_1.toRadians(label.minAngle);
                const labelVisible = labelKey && span > labelMinAngle;
                const midAngle180 = angle_1.normalizeAngle180(midAngle);
                // Split the circle into quadrants like so: ⊗
                const quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
                const quadrantOffset = midAngle180 - quadrantStart;
                const quadrant = Math.floor(quadrantOffset / halfPi);
                const quadrantIndex = number_1.mod(quadrant, quadrantTextOpts.length);
                const { textAlign, textBaseline } = quadrantTextOpts[quadrantIndex];
                groupSelectionData.push({
                    series: this,
                    datum: data[datumIndex],
                    itemId: datumIndex,
                    index: datumIndex,
                    radius,
                    startAngle,
                    endAngle,
                    midAngle,
                    midCos,
                    midSin,
                    label: labelVisible
                        ? {
                            text: labelData[datumIndex],
                            textAlign,
                            textBaseline,
                        }
                        : undefined,
                    sectorLabel: sectorLabelKey
                        ? {
                            text: sectorLabelData[datumIndex],
                        }
                        : undefined,
                });
                datumIndex++;
                end = start; // Update for next iteration.
            });
        });
    }
    createNodeData() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getInnerRadius() {
        const { radius, innerRadiusRatio, innerRadiusOffset } = this;
        const innerRadius = radius * ((innerRadiusRatio !== null && innerRadiusRatio !== void 0 ? innerRadiusRatio : 1)) + (innerRadiusOffset ? innerRadiusOffset : 0);
        if (innerRadius === radius) {
            return 0;
        }
        return innerRadius;
    }
    getOuterRadius() {
        const { radius, outerRadiusRatio, outerRadiusOffset } = this;
        const outerRadius = radius * ((outerRadiusRatio !== null && outerRadiusRatio !== void 0 ? outerRadiusRatio : 1)) + (outerRadiusOffset ? outerRadiusOffset : 0);
        return outerRadius;
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            const { title } = this;
            const innerRadius = this.getInnerRadius();
            const outerRadius = this.getOuterRadius();
            this.radiusScale.range = [innerRadius, outerRadius];
            this.group.translationX = this.centerX;
            this.group.translationY = this.centerY;
            if (title) {
                const outerRadius = Math.max(0, this.radiusScale.range[1]);
                if (outerRadius === 0) {
                    title.node.visible = false;
                }
                else {
                    const titleOffset = 2;
                    title.node.translationY = -outerRadius - titleOffset;
                    title.node.visible = title.enabled;
                }
            }
            yield this.updateSelections();
            yield this.updateNodes();
        });
    }
    updateSelections() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateGroupSelection();
        });
    }
    updateGroupSelection() {
        return __awaiter(this, void 0, void 0, function* () {
            const { groupSelection, highlightSelection, labelSelection, sectorLabelSelection, innerLabelsSelection } = this;
            const update = (selection) => {
                const updateGroups = selection.setData(this.groupSelectionData);
                updateGroups.exit.remove();
                const enterGroups = updateGroups.enter.append(group_1.Group);
                enterGroups.append(sector_1.Sector).each((node) => (node.tag = PieNodeTag.Sector));
                return updateGroups.merge(enterGroups);
            };
            this.groupSelection = update(groupSelection);
            this.highlightSelection = update(highlightSelection);
            const updateLabels = labelSelection.setData(this.groupSelectionData);
            updateLabels.exit.remove();
            const enterLabels = updateLabels.enter.append(group_1.Group);
            enterLabels.append(line_1.Line).each((node) => {
                node.tag = PieNodeTag.Callout;
                node.pointerEvents = node_1.PointerEvents.None;
            });
            enterLabels.append(text_1.Text).each((node) => {
                node.tag = PieNodeTag.Label;
                node.pointerEvents = node_1.PointerEvents.None;
            });
            this.labelSelection = updateLabels.merge(enterLabels);
            const updateSectorLabels = sectorLabelSelection.setData(this.groupSelectionData);
            updateSectorLabels.exit.remove();
            const enterSectorLabels = updateSectorLabels.enter.append(text_1.Text);
            enterSectorLabels.each((node) => {
                node.pointerEvents = node_1.PointerEvents.None;
            });
            this.sectorLabelSelection = updateSectorLabels.merge(enterSectorLabels);
            const updateInnerLabels = innerLabelsSelection.setData(this.innerLabels);
            updateInnerLabels.exit.remove();
            const enterInnerLabels = updateInnerLabels.enter.append(text_1.Text);
            enterInnerLabels.each((node) => {
                node.pointerEvents = node_1.PointerEvents.None;
            });
            this.innerLabelsSelection = updateInnerLabels.merge(enterInnerLabels);
        });
    }
    updateNodes() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chart) {
                return;
            }
            const isVisible = this.seriesItemEnabled.indexOf(true) >= 0;
            this.group.visible = isVisible;
            this.seriesGroup.visible = isVisible;
            this.highlightGroup.visible = isVisible && ((_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.highlightedDatum) === null || _b === void 0 ? void 0 : _b.series) === this;
            this.labelGroup.visible = isVisible;
            this.seriesGroup.opacity = this.getOpacity();
            this.updateInnerCircle();
            const { fills, strokes, fillOpacity: seriesFillOpacity, strokeOpacity, radiusScale, callout, shadow, chart: { highlightedDatum }, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, fillOpacity: highlightFillOpacity = seriesFillOpacity, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, }, }, angleKey, radiusKey, formatter, } = this;
            const centerOffsets = [];
            const innerRadius = radiusScale.convert(0);
            const updateSectorFn = (sector, datum, index, isDatumHighlighted) => {
                const radius = radiusScale.convert(datum.radius, continuousScale_1.clamper);
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : fills[index % fills.length];
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : strokes[index % strokes.length];
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : this.getStrokeWidth(this.strokeWidth);
                let format = undefined;
                if (formatter) {
                    format = formatter({
                        datum: datum.datum,
                        angleKey,
                        radiusKey,
                        fill,
                        stroke,
                        strokeWidth,
                        highlighted: isDatumHighlighted,
                    });
                }
                // Bring highlighted sector's parent group to front.
                const parent = sector.parent && sector.parent.parent;
                if (isDatumHighlighted && parent) {
                    parent.removeChild(sector.parent);
                    parent.appendChild(sector.parent);
                }
                sector.innerRadius = Math.max(0, innerRadius);
                sector.outerRadius = Math.max(0, radius);
                sector.startAngle = datum.startAngle;
                sector.endAngle = datum.endAngle;
                sector.fill = (format && format.fill) || fill;
                sector.stroke = (format && format.stroke) || stroke;
                sector.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
                sector.fillOpacity = fillOpacity;
                sector.strokeOpacity = strokeOpacity;
                sector.lineDash = this.lineDash;
                sector.lineDashOffset = this.lineDashOffset;
                sector.fillShadow = shadow;
                sector.lineJoin = 'round';
                centerOffsets.push(sector.centerOffset);
                this.datumSectorRefs.set(datum, sector);
            };
            this.groupSelection
                .selectByTag(PieNodeTag.Sector)
                .each((node, datum, index) => updateSectorFn(node, datum, index, false));
            this.highlightSelection.selectByTag(PieNodeTag.Sector).each((node, datum, index) => {
                const isDatumHighlighted = !!highlightedDatum && highlightedDatum.series === this && datum.itemId === highlightedDatum.itemId;
                node.visible = isDatumHighlighted;
                if (node.visible) {
                    updateSectorFn(node, datum, index, isDatumHighlighted);
                }
            });
            const { colors: calloutColors, length: calloutLength, strokeWidth: calloutStrokeWidth } = callout;
            this.labelSelection.selectByTag(PieNodeTag.Callout).each((line, datum, index) => {
                const radius = radiusScale.convert(datum.radius, continuousScale_1.clamper);
                const outerRadius = Math.max(0, radius);
                if (datum.label && outerRadius !== 0) {
                    line.strokeWidth = calloutStrokeWidth;
                    line.stroke = calloutColors[index % calloutColors.length];
                    line.x1 = datum.midCos * outerRadius;
                    line.y1 = datum.midSin * outerRadius;
                    line.x2 = datum.midCos * (outerRadius + calloutLength);
                    line.y2 = datum.midSin * (outerRadius + calloutLength);
                }
                else {
                    line.stroke = undefined;
                }
            });
            {
                const { offset, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
                this.labelSelection.selectByTag(PieNodeTag.Label).each((text, datum, index) => {
                    const label = datum.label;
                    const radius = radiusScale.convert(datum.radius, continuousScale_1.clamper);
                    const outerRadius = Math.max(0, radius);
                    if (label && outerRadius !== 0) {
                        const labelRadius = centerOffsets[index] + outerRadius + calloutLength + offset;
                        text.fontStyle = fontStyle;
                        text.fontWeight = fontWeight;
                        text.fontSize = fontSize;
                        text.fontFamily = fontFamily;
                        text.text = label.text;
                        text.x = datum.midCos * labelRadius;
                        text.y = datum.midSin * labelRadius;
                        text.fill = color;
                        text.textAlign = label.textAlign;
                        text.textBaseline = label.textBaseline;
                    }
                    else {
                        text.fill = undefined;
                    }
                });
            }
            this.updateSectorLabelNodes();
            this.updateInnerLabelNodes();
        });
    }
    updateSectorLabelNodes() {
        const { radiusScale } = this;
        const innerRadius = radiusScale.convert(0);
        const { fontSize, fontStyle, fontWeight, fontFamily, positionOffset, positionRatio, color } = this.sectorLabel;
        this.sectorLabelSelection.each((text, datum) => {
            const sectorLabel = datum.sectorLabel;
            const radius = radiusScale.convert(datum.radius, continuousScale_1.clamper);
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
                text.x = datum.midCos * labelRadius;
                text.y = datum.midSin * labelRadius;
                text.textAlign = 'center';
                text.textBaseline = 'middle';
                const sector = this.datumSectorRefs.get(datum);
                if (sector) {
                    const bbox = text.computeBBox();
                    const corners = [
                        [bbox.x, bbox.y],
                        [bbox.x + bbox.width, bbox.y],
                        [bbox.x + bbox.width, bbox.y + bbox.height],
                        [bbox.x, bbox.y + bbox.height],
                    ];
                    const { startAngle, endAngle } = datum;
                    const sectorBounds = { startAngle, endAngle, innerRadius, outerRadius };
                    if (corners.every(([x, y]) => isPointInArc(x, y, sectorBounds))) {
                        isTextVisible = true;
                    }
                }
            }
            text.visible = isTextVisible;
        });
    }
    updateInnerCircle() {
        const circle = this._innerCircleNode;
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
        const textBottoms = [];
        for (let i = 0, prev = -totalHeight / 2; i < textBBoxes.length; i++) {
            const bbox = textBBoxes[i];
            const bottom = bbox.height + prev + getMarginTop(i);
            textBottoms.push(bottom);
            prev = bottom + getMarginBottom(i);
        }
        this.innerLabelsSelection.each((text, _datum, index) => {
            text.y = textBottoms[index];
        });
    }
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            angleKey: this.angleKey,
            labelKey: this.labelKey,
            radiusKey: this.radiusKey,
        });
    }
    getTooltipHtml(nodeDatum) {
        const { angleKey } = this;
        if (!angleKey) {
            return '';
        }
        const { fills, tooltip, angleName, radiusKey, radiusName, labelKey, labelName } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const color = fills[nodeDatum.index % fills.length];
        const datum = nodeDatum.datum;
        const label = labelKey ? `${datum[labelKey]}: ` : '';
        const angleValue = datum[angleKey];
        const formattedAngleValue = typeof angleValue === 'number' ? number_1.toFixed(angleValue) : angleValue.toString();
        const title = this.title ? this.title.text : undefined;
        const content = label + formattedAngleValue;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
                datum,
                angleKey,
                angleValue,
                angleName,
                radiusKey,
                radiusValue: radiusKey ? datum[radiusKey] : undefined,
                radiusName,
                labelKey,
                labelName,
                title,
                color,
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
    }
    listSeriesItems(legendData) {
        const { labelKey, data } = this;
        if (data && data.length && labelKey) {
            const { fills, strokes, id } = this;
            const titleText = this.title && this.title.showInLegend && this.title.text;
            data.forEach((datum, index) => {
                let labelParts = [];
                titleText && labelParts.push(titleText);
                labelParts.push(String(datum[labelKey]));
                legendData.push({
                    id,
                    itemId: index,
                    enabled: this.seriesItemEnabled[index],
                    label: {
                        text: labelParts.join(' - '),
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length],
                        fillOpacity: this.fillOpacity,
                        strokeOpacity: this.strokeOpacity,
                    },
                });
            });
        }
    }
    toggleSeriesItem(itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
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
], PieSeries.prototype, "labelKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "labelName", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "sectorLabelKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], PieSeries.prototype, "sectorLabelName", void 0);
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
