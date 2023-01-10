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
import { HighlightStyle, SeriesTooltip, SeriesNodeClickEvent } from './../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { normalizeAngle180, toRadians } from '../../../util/angle';
import { doOnce } from '../../../util/function';
import { toFixed, mod } from '../../../util/number';
import { Layers } from '../../layers';
import { Caption } from '../../../caption';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { DeprecatedAndRenamedTo } from '../../../util/deprecation';
import { BOOLEAN, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, OPT_STRING, STRING, COLOR_STRING_ARRAY, OPT_COLOR_STRING_ARRAY, Validate, COLOR_STRING, } from '../../../util/validation';
class PieSeriesNodeClickEvent extends SeriesNodeClickEvent {
    constructor(angleKey, calloutLabelKey, sectorLabelKey, radiusKey, nativeEvent, datum, series) {
        super(nativeEvent, datum, series);
        this.angleKey = angleKey;
        this.calloutLabelKey = calloutLabelKey;
        this.sectorLabelKey = sectorLabelKey;
        this.radiusKey = radiusKey;
    }
}
__decorate([
    DeprecatedAndRenamedTo('calloutLabelKey')
], PieSeriesNodeClickEvent.prototype, "labelKey", void 0);
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
        this.minAngle = 20; // in degrees
        this.formatter = undefined;
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
export class PieSeries extends PolarSeries {
    constructor() {
        super({ useLabelLayer: true });
        this.radiusScale = new LinearScale();
        this.groupSelection = Selection.select(this.contentGroup).selectAll();
        this.highlightSelection = Selection.select(this.highlightGroup).selectAll();
        /**
         * The processed data that gets visualized.
         */
        this.groupSelectionData = [];
        this.sectorFormatData = [];
        this.angleScale = (() => {
            const scale = new LinearScale();
            // Each sector is a ratio of the whole, where all ratios add up to 1.
            scale.domain = [0, 1];
            // Add 90 deg to start the first pie at 12 o'clock.
            scale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
            return scale;
        })();
        // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
        this.seriesItemEnabled = [];
        this.calloutLabel = new PieSeriesCalloutLabel();
        this.label = this.calloutLabel;
        this.sectorLabel = new PieSeriesSectorLabel();
        this.calloutLine = new PieSeriesCalloutLine();
        this.callout = this.calloutLine;
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
        this.calloutLabelKey = undefined;
        this.calloutLabelName = undefined;
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
        this.highlightStyle = new HighlightStyle();
        this.datumSectorRefs = new WeakMap();
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
        this.calloutLabelSelection = Selection.select(pieCalloutLabels).selectAll();
        this.sectorLabelSelection = Selection.select(pieSectorLabels).selectAll();
        this.innerLabelsSelection = Selection.select(innerLabels).selectAll();
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
                circle = new Circle();
                circle.fill = value.fill;
                circle.fillOpacity = (_a = value.fillOpacity) !== null && _a !== void 0 ? _a : 1;
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
        const { data, visible } = this;
        this.seriesItemEnabled = (data === null || data === void 0 ? void 0 : data.map(() => visible)) || [];
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
        return __awaiter(this, void 0, void 0, function* () {
            const { angleKey, radiusKey, seriesItemEnabled, angleScale, groupSelectionData, sectorFormatData, calloutLabel, sectorLabel, id: seriesId, } = this;
            const data = angleKey && this.data ? this.data : [];
            const angleData = data.map((datum, index) => (seriesItemEnabled[index] && Math.abs(+datum[angleKey])) || 0);
            const angleDataTotal = angleData.reduce((a, b) => a + b, 0);
            // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie sector.
            // Each sector starts where the previous one ends, so we only keep the ratios for end angles.
            const angleDataRatios = (() => {
                let sum = 0;
                return angleData.map((datum) => (sum += datum / angleDataTotal));
            })();
            const labelFormatter = calloutLabel.formatter;
            const labelKey = calloutLabel.enabled ? this.calloutLabelKey : undefined;
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
                    labelName: this.calloutLabelName,
                    calloutLabelKey: labelKey,
                    calloutLabelValue: labelKey ? datum[labelKey] : undefined,
                    calloutLabelName: this.calloutLabelName,
                    sectorLabelKey,
                    sectorLabelValue: sectorLabelKey ? datum[sectorLabelKey] : undefined,
                    sectorLabelName: this.sectorLabelName,
                    seriesId,
                };
            };
            if (labelKey) {
                if (labelFormatter) {
                    const showValueDeprecationWarning = () => doOnce(() => console.warn('AG Charts - the use of { value } in the pie chart label formatter function is deprecated. Please use { datum, labelKey, ... } instead.'), 'deprecated use of "value" property in pie chart label formatter');
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
                const min = radiusMin !== null && radiusMin !== void 0 ? radiusMin : 0;
                const max = radiusMax ? radiusMax : Math.max(...radii);
                const delta = max - min;
                radiusData = radii.map((value) => (delta ? (value - min) / delta : 1));
            }
            groupSelectionData.length = 0;
            sectorFormatData.length = 0;
            sectorFormatData.push(...data.map((datum, datumIdx) => this.getSectorFormat(datum, datumIdx, datumIdx, false)));
            const rotation = toRadians(this.rotation);
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
                const labelMinAngle = toRadians(calloutLabel.minAngle);
                const labelVisible = labelKey && span > labelMinAngle;
                const midAngle180 = normalizeAngle180(midAngle);
                // Split the circle into quadrants like so: ⊗
                const quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
                const quadrantOffset = midAngle180 - quadrantStart;
                const quadrant = Math.floor(quadrantOffset / halfPi);
                const quadrantIndex = mod(quadrant, quadrantTextOpts.length);
                const { textAlign, textBaseline } = quadrantTextOpts[quadrantIndex];
                const datum = data[datumIndex];
                const itemId = datumIndex;
                groupSelectionData.push({
                    series: this,
                    datum,
                    itemId,
                    index: datumIndex,
                    radius,
                    startAngle,
                    endAngle,
                    midAngle,
                    midCos,
                    midSin,
                    calloutLabel: labelVisible
                        ? {
                            text: labelData[datumIndex],
                            textAlign,
                            textBaseline,
                            hidden: false,
                        }
                        : undefined,
                    sectorLabel: sectorLabelKey
                        ? {
                            text: sectorLabelData[datumIndex],
                        }
                        : undefined,
                    sectorFormat: sectorFormatData[datumIndex],
                });
                datumIndex++;
                end = start; // Update for next iteration.
            });
        });
    }
    getSectorFormat(datum, itemId, index, highlight) {
        var _a, _b, _c, _d, _e;
        const { angleKey, radiusKey, fills, strokes, fillOpacity: seriesFillOpacity, formatter, id: seriesId } = this;
        const highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        const isDatumHighlighted = highlight && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this && itemId === highlightedDatum.itemId;
        const highlightedStyle = isDatumHighlighted ? this.highlightStyle.item : null;
        const fill = (highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fill) || fills[index % fills.length];
        const fillOpacity = (_b = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fillOpacity) !== null && _b !== void 0 ? _b : seriesFillOpacity;
        const stroke = (highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.stroke) || strokes[index % strokes.length];
        const strokeWidth = (_c = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.strokeWidth) !== null && _c !== void 0 ? _c : this.getStrokeWidth(this.strokeWidth);
        let format;
        if (formatter) {
            format = formatter({
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
            fill: (format === null || format === void 0 ? void 0 : format.fill) || fill,
            fillOpacity: (_d = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _d !== void 0 ? _d : fillOpacity,
            stroke: (format === null || format === void 0 ? void 0 : format.stroke) || stroke,
            strokeWidth: (_e = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _e !== void 0 ? _e : strokeWidth,
        };
    }
    createNodeData() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
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
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            const { title } = this;
            this.updateRadiusScale();
            this.rootGroup.translationX = this.centerX;
            this.rootGroup.translationY = this.centerY;
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
            const { groupSelection, highlightSelection, calloutLabelSelection, sectorLabelSelection, innerLabelsSelection, } = this;
            const update = (selection) => {
                const updateGroups = selection.setData(this.groupSelectionData);
                updateGroups.exit.remove();
                const enterGroups = updateGroups.enter.append(Group);
                enterGroups.append(Sector).each((node) => (node.tag = PieNodeTag.Sector));
                return updateGroups.merge(enterGroups);
            };
            this.groupSelection = update(groupSelection);
            this.highlightSelection = update(highlightSelection);
            const updateCalloutLabels = calloutLabelSelection.setData(this.groupSelectionData);
            updateCalloutLabels.exit.remove();
            const enterCalloutLabels = updateCalloutLabels.enter.append(Group);
            enterCalloutLabels.append(Line).each((node) => {
                node.tag = PieNodeTag.Callout;
                node.pointerEvents = PointerEvents.None;
            });
            enterCalloutLabels.append(Text).each((node) => {
                node.tag = PieNodeTag.Label;
                node.pointerEvents = PointerEvents.None;
            });
            this.calloutLabelSelection = updateCalloutLabels.merge(enterCalloutLabels);
            const updateSectorLabels = sectorLabelSelection.setData(this.groupSelectionData);
            updateSectorLabels.exit.remove();
            const enterSectorLabels = updateSectorLabels.enter.append(Text);
            enterSectorLabels.each((node) => {
                node.pointerEvents = PointerEvents.None;
            });
            this.sectorLabelSelection = updateSectorLabels.merge(enterSectorLabels);
            const updateInnerLabels = innerLabelsSelection.setData(this.innerLabels);
            updateInnerLabels.exit.remove();
            const enterInnerLabels = updateInnerLabels.enter.append(Text);
            enterInnerLabels.each((node) => {
                node.pointerEvents = PointerEvents.None;
            });
            this.innerLabelsSelection = updateInnerLabels.merge(enterInnerLabels);
        });
    }
    updateNodes() {
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
                sector.startAngle = datum.startAngle;
                sector.endAngle = datum.endAngle;
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
                this.datumSectorRefs.set(datum, sector);
            };
            this.groupSelection
                .selectByTag(PieNodeTag.Sector)
                .each((node, datum, index) => updateSectorFn(node, datum, index, false));
            this.highlightSelection.selectByTag(PieNodeTag.Sector).each((node, datum, index) => {
                const isDatumHighlighted = (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this && datum.itemId === highlightedDatum.itemId;
                node.visible = isDatumHighlighted;
                if (node.visible) {
                    updateSectorFn(node, datum, index, isDatumHighlighted);
                }
            });
            this.updateCalloutLineNodes();
            this.updateCalloutLabelNodes();
            this.updateSectorLabelNodes();
            this.updateInnerLabelNodes();
        });
    }
    updateCalloutLineNodes() {
        const { radiusScale, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const calloutStrokeWidth = calloutLine.strokeWidth;
        const calloutColors = calloutLine.colors || this.strokes;
        this.calloutLabelSelection.selectByTag(PieNodeTag.Callout).each((line, datum, index) => {
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            if (datum.calloutLabel && outerRadius !== 0 && !datum.calloutLabel.hidden) {
                line.strokeWidth = calloutStrokeWidth;
                line.stroke = calloutColors[index % calloutColors.length];
                line.x1 = datum.midCos * outerRadius;
                line.y1 = datum.midSin * outerRadius;
                line.x2 = datum.midCos * (outerRadius + calloutLength);
                line.y2 = datum.midSin * (outerRadius + calloutLength);
                line.visible = true;
            }
            else {
                line.visible = false;
            }
        });
    }
    getLabelOverflow(text, box) {
        const seriesBox = this.chart.getSeriesRect();
        const seriesLeft = seriesBox.x - this.centerX;
        const seriesRight = seriesBox.x + seriesBox.width - this.centerX;
        const seriesTop = seriesBox.y - this.centerY;
        const seriesBottom = seriesBox.y + seriesBox.height - this.centerY;
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
        return { visibleTextPart, textLength, hasVerticalOverflow };
    }
    updateCalloutLabelNodes() {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, color } = calloutLabel;
        const tempTextNode = new Text();
        this.calloutLabelSelection.selectByTag(PieNodeTag.Label).each((text, datum) => {
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            if (!label || outerRadius === 0 || label.hidden) {
                text.visible = false;
                return;
            }
            const labelRadius = outerRadius + calloutLength + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius;
            // Detect text overflow
            this.setTextDimensionalProps(tempTextNode, x, y, label);
            const box = tempTextNode.computeBBox();
            const { visibleTextPart, textLength, hasVerticalOverflow } = this.getLabelOverflow(label.text, box);
            const displayText = visibleTextPart === 1 ? label.text : `${label.text.substring(0, textLength)}…`;
            this.setTextDimensionalProps(text, x, y, Object.assign(Object.assign({}, label), { text: displayText }));
            text.fill = color;
            text.visible = !hasVerticalOverflow;
        });
    }
    computeLabelsBBox(options) {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset } = calloutLabel;
        this.updateRadiusScale();
        const text = new Text();
        const textBoxes = this.groupSelectionData
            .map((datum) => {
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            if (!label || outerRadius === 0) {
                return null;
            }
            const labelRadius = outerRadius + calloutLength + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius;
            this.setTextDimensionalProps(text, x, y, label);
            const box = text.computeBBox();
            if (options.hideWhenNecessary) {
                const { textLength, hasVerticalOverflow } = this.getLabelOverflow(label.text, box);
                const isTooShort = textLength < 2;
                if (hasVerticalOverflow || isTooShort) {
                    label.hidden = true;
                    return null;
                }
            }
            label.hidden = false;
            return box;
        })
            .filter((box) => box != null);
        if (textBoxes.length === 0) {
            return null;
        }
        return BBox.merge(textBoxes);
    }
    setTextDimensionalProps(textNode, x, y, label) {
        const { calloutLabel } = this;
        const { fontStyle, fontWeight, fontSize, fontFamily } = calloutLabel;
        textNode.fontStyle = fontStyle;
        textNode.fontWeight = fontWeight;
        textNode.fontSize = fontSize;
        textNode.fontFamily = fontFamily;
        textNode.text = label.text;
        textNode.x = x;
        textNode.y = y;
        textNode.textAlign = label.textAlign;
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
    getTooltipHtml(nodeDatum) {
        const { angleKey } = this;
        if (!angleKey) {
            return '';
        }
        const { tooltip, angleName, radiusKey, radiusName, calloutLabelKey, sectorLabelKey, calloutLabelName, sectorLabelName, id: seriesId, } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const color = nodeDatum.sectorFormat.fill;
        const datum = nodeDatum.datum;
        const label = calloutLabelKey ? `${datum[calloutLabelKey]}: ` : '';
        const angleValue = datum[angleKey];
        const formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : angleValue.toString();
        const title = this.title ? this.title.text : undefined;
        const content = label + formattedAngleValue;
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
                radiusValue: radiusKey ? datum[radiusKey] : undefined,
                radiusName,
                labelKey: calloutLabelKey,
                labelName: calloutLabelName,
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
        const { calloutLabelKey, data, sectorFormatData } = this;
        if (data && data.length && calloutLabelKey) {
            const { id } = this;
            const legendData = [];
            const titleText = this.title && this.title.showInLegend && this.title.text;
            data.forEach((datum, index) => {
                let labelParts = [];
                titleText && labelParts.push(titleText);
                labelParts.push(String(datum[calloutLabelKey]));
                legendData.push({
                    id,
                    itemId: index,
                    seriesId: id,
                    enabled: this.seriesItemEnabled[index],
                    label: {
                        text: labelParts.join(' - '),
                    },
                    marker: {
                        fill: sectorFormatData[index].fill,
                        stroke: sectorFormatData[index].stroke,
                        fillOpacity: this.fillOpacity,
                        strokeOpacity: this.strokeOpacity,
                    },
                });
            });
            return legendData;
        }
        return [];
    }
    toggleSeriesItem(itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    }
}
PieSeries.className = 'PieSeries';
PieSeries.type = 'pie';
__decorate([
    DeprecatedAndRenamedTo('calloutLabel')
], PieSeries.prototype, "label", void 0);
__decorate([
    DeprecatedAndRenamedTo('calloutLine')
], PieSeries.prototype, "callout", void 0);
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
    DeprecatedAndRenamedTo('calloutLabelKey')
], PieSeries.prototype, "labelKey", void 0);
__decorate([
    DeprecatedAndRenamedTo('calloutLabelName')
], PieSeries.prototype, "labelName", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "sectorLabelKey", void 0);
__decorate([
    Validate(OPT_STRING)
], PieSeries.prototype, "sectorLabelName", void 0);
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
