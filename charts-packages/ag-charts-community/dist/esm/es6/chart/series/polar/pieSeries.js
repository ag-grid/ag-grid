var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Group } from "../../../scene/group";
import { Line } from "../../../scene/shape/line";
import { Text } from "../../../scene/shape/text";
import { Selection } from "../../../scene/selection";
import { LinearScale } from "../../../scale/linearScale";
import { Sector } from "../../../scene/shape/sector";
import { HighlightStyle, SeriesTooltip } from "./../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { normalizeAngle180, toRadians } from "../../../util/angle";
import { toFixed, mod } from "../../../util/number";
import { Caption } from "../../../caption";
import { reactive, Observable } from "../../../util/observable";
import { PolarSeries } from "./polarSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { toTooltipHtml } from "../../chart";
class PieHighlightStyle extends HighlightStyle {
}
var PieNodeTag;
(function (PieNodeTag) {
    PieNodeTag[PieNodeTag["Sector"] = 0] = "Sector";
    PieNodeTag[PieNodeTag["Callout"] = 1] = "Callout";
    PieNodeTag[PieNodeTag["Label"] = 2] = "Label";
})(PieNodeTag || (PieNodeTag = {}));
class PieSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.offset = 3; // from the callout line
        this.minAngle = 20; // in degrees
    }
}
__decorate([
    reactive('change')
], PieSeriesLabel.prototype, "offset", void 0);
__decorate([
    reactive('dataChange')
], PieSeriesLabel.prototype, "minAngle", void 0);
__decorate([
    reactive('dataChange')
], PieSeriesLabel.prototype, "formatter", void 0);
class PieSeriesCallout extends Observable {
    constructor() {
        super(...arguments);
        this.colors = [
            '#874349',
            '#718661',
            '#a48f5f',
            '#5a7088',
            '#7f637a',
            '#5d8692'
        ];
        this.length = 10;
        this.strokeWidth = 1;
    }
}
__decorate([
    reactive('change')
], PieSeriesCallout.prototype, "colors", void 0);
__decorate([
    reactive('change')
], PieSeriesCallout.prototype, "length", void 0);
__decorate([
    reactive('change')
], PieSeriesCallout.prototype, "strokeWidth", void 0);
export class PieSeriesTooltip extends SeriesTooltip {
}
__decorate([
    reactive('change')
], PieSeriesTooltip.prototype, "renderer", void 0);
export class PieTitle extends Caption {
    constructor() {
        super(...arguments);
        this.showInLegend = false;
    }
}
__decorate([
    reactive()
], PieTitle.prototype, "showInLegend", void 0);
export class PieSeries extends PolarSeries {
    constructor() {
        super();
        this.radiusScale = new LinearScale();
        this.groupSelection = Selection.select(this.pickGroup).selectAll();
        /**
         * The processed data that gets visualized.
         */
        this.groupSelectionData = [];
        this.angleScale = (() => {
            const scale = new LinearScale();
            // Each slice is a ratio of the whole, where all ratios add up to 1.
            scale.domain = [0, 1];
            // Add 90 deg to start the first pie at 12 o'clock.
            scale.range = [-Math.PI, Math.PI].map(angle => angle + Math.PI / 2);
            return scale;
        })();
        // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
        this.seriesItemEnabled = [];
        this.label = new PieSeriesLabel();
        this.callout = new PieSeriesCallout();
        this.tooltip = new PieSeriesTooltip();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie slice angle).
         */
        this.angleKey = '';
        this.angleName = '';
        this._fills = [
            '#c16068',
            '#a2bf8a',
            '#ebcc87',
            '#80a0c3',
            '#b58dae',
            '#85c0d1'
        ];
        this._strokes = [
            '#874349',
            '#718661',
            '#a48f5f',
            '#5a7088',
            '#7f637a',
            '#5d8692'
        ];
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        /**
         * The series rotation in degrees.
         */
        this.rotation = 0;
        this.outerRadiusOffset = 0;
        this.innerRadiusOffset = 0;
        this.strokeWidth = 1;
        this.highlightStyle = new PieHighlightStyle();
        this.addEventListener('update', this.scheduleUpdate, this);
        this.label.addEventListener('change', this.scheduleUpdate, this);
        this.label.addEventListener('dataChange', this.scheduleData, this);
        this.callout.addEventListener('change', this.scheduleLayout, this);
        this.addPropertyListener('data', event => {
            if (event.value) {
                event.source.seriesItemEnabled = event.value.map(() => true);
            }
        });
    }
    set title(value) {
        const oldTitle = this._title;
        function updateLegend() {
            this.fireEvent({ type: 'legendChange' });
        }
        if (oldTitle !== value) {
            if (oldTitle) {
                oldTitle.removeEventListener('change', this.scheduleUpdate, this);
                oldTitle.removePropertyListener('showInLegend', updateLegend, this);
                this.group.removeChild(oldTitle.node);
            }
            if (value) {
                value.node.textBaseline = 'bottom';
                value.addEventListener('change', this.scheduleUpdate, this);
                value.addPropertyListener('showInLegend', updateLegend, this);
                this.group.appendChild(value.node);
            }
            this._title = value;
            this.scheduleUpdate();
        }
    }
    get title() {
        return this._title;
    }
    set fills(values) {
        this._fills = values;
        this.scheduleUpdate();
    }
    get fills() {
        return this._fills;
    }
    set strokes(values) {
        this._strokes = values;
        this.scheduleUpdate();
    }
    get strokes() {
        return this._strokes;
    }
    onHighlightChange() {
        this.updateNodes();
    }
    setColors(fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
        this.callout.colors = strokes;
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
        const { angleKey, radiusKey, seriesItemEnabled, angleScale, groupSelectionData, label } = this;
        const data = angleKey && this.data ? this.data : [];
        const angleData = data.map((datum, index) => seriesItemEnabled[index] && Math.abs(+datum[angleKey]) || 0);
        const angleDataTotal = angleData.reduce((a, b) => a + b, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        const angleDataRatios = (() => {
            let sum = 0;
            return angleData.map(datum => sum += datum / angleDataTotal);
        })();
        const labelFormatter = label.formatter;
        const labelKey = label.enabled && this.labelKey;
        let labelData = [];
        let radiusData = [];
        if (labelKey) {
            if (labelFormatter) {
                labelData = data.map(datum => labelFormatter({ value: datum[labelKey] }));
            }
            else {
                labelData = data.map(datum => String(datum[labelKey]));
            }
        }
        if (radiusKey) {
            const { radiusMin, radiusMax } = this;
            const radii = data.map(datum => Math.abs(datum[radiusKey]));
            const min = radiusMin !== undefined ? radiusMin : Math.min(...radii);
            const max = radiusMax !== undefined ? radiusMax : Math.max(...radii);
            const delta = max - min;
            radiusData = radii.map(value => delta ? (value - min) / delta : 1);
        }
        groupSelectionData.length = 0;
        const rotation = toRadians(this.rotation);
        const halfPi = Math.PI / 2;
        let datumIndex = 0;
        const quadrantTextOpts = [
            { textAlign: 'center', textBaseline: 'bottom' },
            { textAlign: 'left', textBaseline: 'middle' },
            { textAlign: 'center', textBaseline: 'hanging' },
            { textAlign: 'right', textBaseline: 'middle' },
        ];
        // Process segments.
        let end = 0;
        angleDataRatios.forEach((start) => {
            if (isNaN(start)) {
                return;
            } // No segments displayed - nothing to do.
            const radius = radiusKey ? radiusData[datumIndex] : 1;
            const startAngle = angleScale.convert(start) + rotation;
            const endAngle = angleScale.convert(end) + rotation;
            const midAngle = (startAngle + endAngle) / 2;
            const span = Math.abs(endAngle - startAngle);
            const midCos = Math.cos(midAngle);
            const midSin = Math.sin(midAngle);
            const labelMinAngle = toRadians(label.minAngle);
            const labelVisible = labelKey && span > labelMinAngle;
            const midAngle180 = normalizeAngle180(midAngle);
            // Split the circle into quadrants like so: ⊗
            const quadrantStart = -3 * Math.PI / 4; // same as `normalizeAngle180(toRadians(-135))`
            const quadrantOffset = midAngle180 - quadrantStart;
            const quadrant = Math.floor(quadrantOffset / halfPi);
            const quadrantIndex = mod(quadrant, quadrantTextOpts.length);
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
                label: labelVisible ? {
                    text: labelData[datumIndex],
                    textAlign,
                    textBaseline
                } : undefined
            });
            datumIndex++;
            end = start; // Update for next iteration.
        });
        return true;
    }
    update() {
        this.updatePending = false;
        const { radius, innerRadiusOffset, outerRadiusOffset, title } = this;
        this.radiusScale.range = [
            innerRadiusOffset ? radius + innerRadiusOffset : 0,
            radius + (outerRadiusOffset || 0)
        ];
        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;
        if (title) {
            const outerRadius = Math.max(0, this.radiusScale.range[1]);
            if (outerRadius === 0) {
                title.node.visible = false;
            }
            else {
                title.node.translationY = -radius - outerRadiusOffset - 2;
                title.node.visible = title.enabled;
            }
        }
        this.updateSelections();
        this.updateNodes();
    }
    updateSelections() {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;
        this.updateGroupSelection();
    }
    updateGroupSelection() {
        const updateGroups = this.groupSelection.setData(this.groupSelectionData);
        updateGroups.exit.remove();
        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Sector).each(node => node.tag = PieNodeTag.Sector);
        enterGroups.append(Line).each(node => {
            node.tag = PieNodeTag.Callout;
            node.pointerEvents = PointerEvents.None;
        });
        enterGroups.append(Text).each(node => {
            node.tag = PieNodeTag.Label;
            node.pointerEvents = PointerEvents.None;
        });
        this.groupSelection = updateGroups.merge(enterGroups);
    }
    updateNodes() {
        if (!this.chart) {
            return;
        }
        this.group.visible = this.visible && this.seriesItemEnabled.indexOf(true) >= 0;
        const { fills, strokes, fillOpacity, strokeOpacity, radiusScale, callout, shadow, chart: { highlightedDatum }, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, } }, angleKey, radiusKey, formatter } = this;
        const centerOffsets = [];
        const innerRadius = radiusScale.convert(0);
        this.groupSelection.selectByTag(PieNodeTag.Sector).each((sector, datum, index) => {
            const radius = radiusScale.convert(datum.radius);
            const isDatumHighlighted = !!highlightedDatum && highlightedDatum.series === this && datum.itemId === highlightedDatum.itemId;
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : fills[index % fills.length];
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : strokes[index % strokes.length];
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
                    highlighted: isDatumHighlighted
                });
            }
            // Bring highlighted slice's parent group to front.
            const parent = sector.parent && sector.parent.parent;
            if (isDatumHighlighted && parent) {
                parent.removeChild(sector.parent);
                parent.appendChild(sector.parent);
            }
            sector.innerRadius = Math.max(0, innerRadius);
            sector.outerRadius = Math.max(0, radius);
            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;
            sector.fill = format && format.fill || fill;
            sector.stroke = format && format.stroke || stroke;
            sector.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.lineDash = this.lineDash;
            sector.lineDashOffset = this.lineDashOffset;
            sector.fillShadow = shadow;
            sector.lineJoin = 'round';
            sector.opacity = this.getOpacity();
            centerOffsets.push(sector.centerOffset);
        });
        const { colors: calloutColors, length: calloutLength, strokeWidth: calloutStrokeWidth } = callout;
        this.groupSelection.selectByTag(PieNodeTag.Callout).each((line, datum, index) => {
            const radius = radiusScale.convert(datum.radius);
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
            this.groupSelection.selectByTag(PieNodeTag.Label).each((text, datum, index) => {
                const label = datum.label;
                const radius = radiusScale.convert(datum.radius);
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
    }
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            angleKey: this.angleKey,
            labelKey: this.labelKey,
            radiusKey: this.radiusKey
        });
    }
    getTooltipHtml(nodeDatum) {
        const { angleKey } = this;
        if (!angleKey) {
            return '';
        }
        const { fills, tooltip, angleName, radiusKey, radiusName, labelKey, labelName, } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const color = fills[nodeDatum.index % fills.length];
        const datum = nodeDatum.datum;
        const label = labelKey ? `${datum[labelKey]}: ` : '';
        const angleValue = datum[angleKey];
        const formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : angleValue.toString();
        const title = this.title ? this.title.text : undefined;
        const content = label + formattedAngleValue;
        const defaults = {
            title,
            backgroundColor: color,
            content
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
                labelKey,
                labelName,
                title,
                color,
            }), defaults);
        }
        return toTooltipHtml(defaults);
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
                        text: labelParts.join(' - ')
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length],
                        fillOpacity: this.fillOpacity,
                        strokeOpacity: this.strokeOpacity
                    }
                });
            });
        }
    }
    toggleSeriesItem(itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.scheduleData();
    }
}
PieSeries.className = 'PieSeries';
PieSeries.type = 'pie';
__decorate([
    reactive('dataChange')
], PieSeries.prototype, "angleKey", void 0);
__decorate([
    reactive('update')
], PieSeries.prototype, "angleName", void 0);
__decorate([
    reactive('dataChange')
], PieSeries.prototype, "radiusKey", void 0);
__decorate([
    reactive('update')
], PieSeries.prototype, "radiusName", void 0);
__decorate([
    reactive('dataChange')
], PieSeries.prototype, "radiusMin", void 0);
__decorate([
    reactive('dataChange')
], PieSeries.prototype, "radiusMax", void 0);
__decorate([
    reactive('dataChange')
], PieSeries.prototype, "labelKey", void 0);
__decorate([
    reactive('update')
], PieSeries.prototype, "labelName", void 0);
__decorate([
    reactive('layoutChange')
], PieSeries.prototype, "fillOpacity", void 0);
__decorate([
    reactive('layoutChange')
], PieSeries.prototype, "strokeOpacity", void 0);
__decorate([
    reactive('update')
], PieSeries.prototype, "lineDash", void 0);
__decorate([
    reactive('update')
], PieSeries.prototype, "lineDashOffset", void 0);
__decorate([
    reactive('update')
], PieSeries.prototype, "formatter", void 0);
__decorate([
    reactive('dataChange')
], PieSeries.prototype, "rotation", void 0);
__decorate([
    reactive('layoutChange')
], PieSeries.prototype, "outerRadiusOffset", void 0);
__decorate([
    reactive('dataChange')
], PieSeries.prototype, "innerRadiusOffset", void 0);
__decorate([
    reactive('layoutChange')
], PieSeries.prototype, "strokeWidth", void 0);
__decorate([
    reactive('layoutChange')
], PieSeries.prototype, "shadow", void 0);
//# sourceMappingURL=pieSeries.js.map