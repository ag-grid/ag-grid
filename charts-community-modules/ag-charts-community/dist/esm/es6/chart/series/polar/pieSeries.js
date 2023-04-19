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
import { HighlightStyle, SeriesTooltip, SeriesNodeBaseClickEvent } from './../series';
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
import { DeprecatedAndRenamedTo } from '../../../util/deprecation';
import { BOOLEAN, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, OPT_STRING, STRING, COLOR_STRING_ARRAY, OPT_COLOR_STRING_ARRAY, Validate, COLOR_STRING, } from '../../../util/validation';
import { Logger } from '../../../util/logger';
class PieSeriesNodeBaseClickEvent extends SeriesNodeBaseClickEvent {
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
], PieSeriesNodeBaseClickEvent.prototype, "labelKey", void 0);
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
export class PieSeries extends PolarSeries {
    constructor() {
        super({ useLabelLayer: true });
        this.radiusScale = new LinearScale();
        this.groupSelection = Selection.select(this.contentGroup, Group);
        this.highlightSelection = Selection.select(this.highlightGroup, Group);
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
        this.calloutLabelSelection = Selection.select(pieCalloutLabels, Group);
        this.sectorLabelSelection = Selection.select(pieSectorLabels, Text);
        this.innerLabelsSelection = Selection.select(innerLabels, Text);
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
                    const showValueDeprecationWarning = () => Logger.warnOnce('the use of { value } in the pie chart label formatter function is deprecated. Please use { datum, labelKey, ... } instead.');
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
                            collisionTextAlign: undefined,
                            collisionOffsetY: 0,
                            box: undefined,
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
    getTitleTranslationY() {
        var _a, _b;
        const outerRadius = Math.max(0, this.radiusScale.range[1]);
        if (outerRadius === 0) {
            return NaN;
        }
        const spacing = (_b = (_a = this.title) === null || _a === void 0 ? void 0 : _a.spacing) !== null && _b !== void 0 ? _b : 0;
        const titleOffset = 2 + spacing;
        const minLabelY = Math.min(0, ...this.groupSelectionData.map((d) => { var _a, _b; return ((_b = (_a = d.calloutLabel) === null || _a === void 0 ? void 0 : _a.box) === null || _b === void 0 ? void 0 : _b.y) || 0; }));
        const dy = Math.max(0, -outerRadius - minLabelY);
        return -outerRadius - titleOffset - dy;
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            const { title } = this;
            this.updateRadiusScale();
            this.rootGroup.translationX = this.centerX;
            this.rootGroup.translationY = this.centerY;
            if (title) {
                const dy = this.getTitleTranslationY();
                if (isFinite(dy)) {
                    title.node.visible = title.enabled;
                    title.node.translationY = dy;
                }
                else {
                    title.node.visible = false;
                }
            }
            this.updateNodeMidPoint();
            yield this.updateSelections();
            yield this.updateNodes();
        });
    }
    updateNodeMidPoint() {
        this.groupSelectionData.forEach((d) => {
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
                return selection.update(this.groupSelectionData, (group) => {
                    const sector = new Sector();
                    sector.tag = PieNodeTag.Sector;
                    group.appendChild(sector);
                });
            };
            this.groupSelection = update(groupSelection);
            this.highlightSelection = update(highlightSelection);
            calloutLabelSelection.update(this.groupSelectionData, (group) => {
                const line = new Line();
                line.tag = PieNodeTag.Callout;
                line.pointerEvents = PointerEvents.None;
                group.appendChild(line);
                const text = new Text();
                text.tag = PieNodeTag.Label;
                text.pointerEvents = PointerEvents.None;
                group.appendChild(text);
            });
            sectorLabelSelection.update(this.groupSelectionData, (node) => {
                node.pointerEvents = PointerEvents.None;
            });
            innerLabelsSelection.update(this.innerLabels, (node) => {
                node.pointerEvents = PointerEvents.None;
            });
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
                sector.visible = this.seriesItemEnabled[index];
                this.datumSectorRefs.set(datum, sector);
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
        const { offset } = this.calloutLabel;
        this.calloutLabelSelection.selectByTag(PieNodeTag.Callout).forEach((line, index) => {
            const datum = line.datum;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            const label = datum.calloutLabel;
            if (label && label.text && !label.hidden && outerRadius !== 0) {
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
                    const cx = x2 < box.x ? box.x : x2 > box.x + box.width ? box.x + box.width : x2;
                    const cy = y2 < box.y ? box.y : y2 > box.y + box.height ? box.y + box.height : y2;
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
        const fullData = this.groupSelectionData;
        const data = this.groupSelectionData.filter((text) => !shouldSkip(text));
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
            loop: for (let i = 0; i < paddedBoxes.length; i++) {
                const box = paddedBoxes[i];
                for (let j = i + 1; j < labels.length; j++) {
                    const other = paddedBoxes[j];
                    if (box.collidesBBox(other)) {
                        labelsCollideLabelsByX = true;
                        break loop;
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
                label.collisionTextAlign = datum.midCos < 0 ? 'right' : datum.midCos > 0 ? 'left' : 'center';
            });
        };
        avoidYCollisions(leftLabels);
        avoidYCollisions(rightLabels);
        avoidXCollisions(topLabels);
        avoidXCollisions(bottomLabels);
    }
    updateCalloutLabelNodes() {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, color } = calloutLabel;
        const tempTextNode = new Text();
        this.calloutLabelSelection.selectByTag(PieNodeTag.Label).forEach((text) => {
            const { datum } = text;
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius);
            const outerRadius = Math.max(0, radius);
            if (!label || !label.text || outerRadius === 0 || label.hidden) {
                text.visible = false;
                return;
            }
            const labelRadius = outerRadius + calloutLength + offset;
            const x = datum.midCos * labelRadius;
            const y = datum.midSin * labelRadius + label.collisionOffsetY;
            // Detect text overflow
            this.setTextDimensionalProps(tempTextNode, x, y, this.calloutLabel, label);
            const box = tempTextNode.computeBBox();
            const { visibleTextPart, textLength, hasVerticalOverflow } = this.getLabelOverflow(label.text, box);
            const displayText = visibleTextPart === 1 ? label.text : `${label.text.substring(0, textLength)}…`;
            this.setTextDimensionalProps(text, x, y, this.calloutLabel, Object.assign(Object.assign({}, label), { text: displayText }));
            text.fill = color;
            text.visible = !hasVerticalOverflow;
        });
    }
    computeLabelsBBox(options) {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, maxCollisionOffset } = calloutLabel;
        this.updateRadiusScale();
        this.computeCalloutLabelCollisionOffsets();
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
            const y = datum.midSin * labelRadius + label.collisionOffsetY;
            this.setTextDimensionalProps(text, x, y, this.calloutLabel, label);
            const box = text.computeBBox();
            label.box = box;
            if (Math.abs(label.collisionOffsetY) > maxCollisionOffset) {
                label.hidden = true;
                return null;
            }
            if (options.hideWhenNecessary) {
                const { textLength, hasVerticalOverflow } = this.getLabelOverflow(label.text, box);
                const isTooShort = label.text.length > 2 && textLength < 2;
                if (hasVerticalOverflow || isTooShort) {
                    label.hidden = true;
                    return null;
                }
            }
            label.hidden = false;
            return box;
        })
            .filter((box) => box != null);
        if (this.title && this.title.text) {
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
                const box = text.computeBBox();
                textBoxes.push(box);
            }
        }
        if (textBoxes.length === 0) {
            return null;
        }
        return BBox.merge(textBoxes);
    }
    setTextDimensionalProps(textNode, x, y, style, label) {
        const { fontStyle, fontWeight, fontSize, fontFamily } = style;
        textNode.fontStyle = fontStyle;
        textNode.fontWeight = fontWeight;
        textNode.fontSize = fontSize;
        textNode.fontFamily = fontFamily;
        textNode.text = label.text;
        textNode.x = x;
        textNode.y = y;
        textNode.textAlign = label.collisionTextAlign || label.textAlign;
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
                    if (corners.every(([x, y]) => isPointInSector(x, y, sectorBounds))) {
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
    getNodeDoubleClickEvent(event, datum) {
        return new PieSeriesNodeDoubleClickEvent(this.angleKey, this.calloutLabelKey, this.sectorLabelKey, this.radiusKey, event, datum, this);
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
        const { calloutLabelKey, legendItemKey, data, id, sectorFormatData } = this;
        if (!data || data.length === 0 || (!legendItemKey && !calloutLabelKey))
            return [];
        const titleText = this.title && this.title.showInLegend && this.title.text;
        const legendData = data.map((datum, index) => {
            const labelParts = [];
            titleText && labelParts.push(titleText);
            if (legendItemKey) {
                labelParts.push(String(datum[legendItemKey]));
            }
            else if (calloutLabelKey) {
                labelParts.push(String(datum[calloutLabelKey]));
            }
            return {
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
            };
        });
        return legendData;
    }
    toggleSeriesItem(itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    }
    toggleOtherSeriesItems(seriesToggled, datumToggled, enabled, suggestedEnabled) {
        var _a, _b;
        const { legendItemKey } = this;
        if (seriesToggled.type !== 'pie')
            return;
        if (legendItemKey === undefined)
            return;
        const pieSeriesToggled = seriesToggled;
        const datumToggledLegendItemValue = datumToggled &&
            pieSeriesToggled.legendItemKey && ((_a = pieSeriesToggled.data) === null || _a === void 0 ? void 0 : _a.find((_, index) => index === datumToggled.itemId)[pieSeriesToggled.legendItemKey]);
        if (!datumToggledLegendItemValue)
            return;
        (_b = this.data) === null || _b === void 0 ? void 0 : _b.forEach((d, itemId) => {
            if (enabled !== undefined && d[legendItemKey] === datumToggledLegendItemValue) {
                this.toggleSeriesItem(itemId, enabled);
            }
            else if (suggestedEnabled !== undefined) {
                this.toggleSeriesItem(itemId, suggestedEnabled || d[legendItemKey] === datumToggledLegendItemValue);
            }
        });
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
