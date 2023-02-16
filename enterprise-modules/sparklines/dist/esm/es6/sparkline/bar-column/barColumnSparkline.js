import { _Scene, _Util } from 'ag-charts-community';
import { Sparkline } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Label } from '../label/label';
const { extent } = _Util;
var BarColumnNodeTag;
(function (BarColumnNodeTag) {
    BarColumnNodeTag[BarColumnNodeTag["Rect"] = 0] = "Rect";
    BarColumnNodeTag[BarColumnNodeTag["Label"] = 1] = "Label";
})(BarColumnNodeTag || (BarColumnNodeTag = {}));
export var BarColumnLabelPlacement;
(function (BarColumnLabelPlacement) {
    BarColumnLabelPlacement["InsideBase"] = "insideBase";
    BarColumnLabelPlacement["InsideEnd"] = "insideEnd";
    BarColumnLabelPlacement["Center"] = "center";
    BarColumnLabelPlacement["OutsideEnd"] = "outsideEnd";
})(BarColumnLabelPlacement || (BarColumnLabelPlacement = {}));
export class BarColumnLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
        this.placement = BarColumnLabelPlacement.InsideEnd;
    }
}
export class BarColumnSparkline extends Sparkline {
    constructor() {
        super();
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'silver';
        this.strokeWidth = 0;
        this.paddingInner = 0.1;
        this.paddingOuter = 0.2;
        this.valueAxisDomain = undefined;
        this.formatter = undefined;
        this.axisLine = new _Scene.Line();
        this.bandWidth = 0;
        this.sparklineGroup = new _Scene.Group();
        this.rectGroup = new _Scene.Group();
        this.labelGroup = new _Scene.Group();
        this.rectSelection = _Scene.Selection.select(this.rectGroup).selectAll();
        this.labelSelection = _Scene.Selection.select(this.labelGroup).selectAll();
        this.nodeSelectionData = [];
        this.label = new BarColumnLabel();
        this.rootGroup.append(this.sparklineGroup);
        this.sparklineGroup.append([this.rectGroup, this.axisLine, this.labelGroup]);
        this.axisLine.lineCap = 'round';
        this.label.enabled = false;
    }
    getNodeData() {
        return this.nodeSelectionData;
    }
    update() {
        this.updateSelections();
        this.updateNodes();
    }
    updateSelections() {
        const nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.nodeSelectionData = nodeData;
        this.updateRectSelection(nodeData);
        this.updateLabelSelection(nodeData);
    }
    updateNodes() {
        this.updateRectNodes();
        this.updateLabelNodes();
    }
    calculateStep(range) {
        var _a;
        const { xScale, paddingInner, paddingOuter, smallestInterval } = this;
        // calculate step
        let domainLength = xScale.domain[1] - xScale.domain[0];
        let intervals = (domainLength / ((_a = smallestInterval === null || smallestInterval === void 0 ? void 0 : smallestInterval.x) !== null && _a !== void 0 ? _a : 1)) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum of 50 bands to ensure the step (width of individual bands + padding) does not fall below a certain number of pixels.
        // If the number of intervals exceeds 50, calculate the step for 50 bands within the given range.
        // This means there could be some overlap of the bands in the sparkline.
        const maxBands = 50;
        const bands = Math.min(intervals, maxBands);
        const gaps = bands - 1; // number of gaps (padding between bands)
        const step = range / Math.max(1, (2 * paddingOuter) + (gaps * paddingInner) + bands); // step width is a combination of band width and gap width
        return step;
    }
    updateYScaleDomain() {
        const { yScale, yData, valueAxisDomain } = this;
        const yMinMax = extent(yData);
        let yMin = 0;
        let yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;
        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;
        if (valueAxisDomain) {
            if (valueAxisDomain[1] < yMax) {
                valueAxisDomain[1] = yMax;
            }
            if (valueAxisDomain[0] > yMin) {
                valueAxisDomain[0] = yMin;
            }
        }
        yScale.domain = valueAxisDomain ? valueAxisDomain : [yMin, yMax];
    }
    updateRectSelection(selectionData) {
        const updateRectSelection = this.rectSelection.setData(selectionData);
        const enterRectSelection = updateRectSelection.enter.append(_Scene.Rect);
        updateRectSelection.exit.remove();
        this.rectSelection = updateRectSelection.merge(enterRectSelection);
    }
    updateRectNodes() {
        const { highlightedDatum, formatter: nodeFormatter, fill, stroke, strokeWidth } = this;
        const { fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = this.highlightStyle;
        this.rectSelection.each((node, datum, index) => {
            const highlighted = datum === highlightedDatum;
            const nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            const nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            const nodeStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;
            let nodeFormat;
            const { x, y, width, height, seriesDatum } = datum;
            if (nodeFormatter) {
                const first = index === 0;
                const last = index === this.nodeSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;
                nodeFormat = nodeFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min,
                    max,
                    first,
                    last,
                    fill: nodeFill,
                    stroke: nodeStroke,
                    strokeWidth: nodeStrokeWidth,
                    highlighted,
                });
            }
            node.fill = (nodeFormat && nodeFormat.fill) || nodeFill;
            node.stroke = (nodeFormat && nodeFormat.stroke) || nodeStroke;
            node.strokeWidth = (nodeFormat && nodeFormat.strokeWidth) || nodeStrokeWidth;
            node.x = node.y = 0;
            node.width = width;
            node.height = height;
            node.visible = node.height > 0;
            node.translationX = x;
            node.translationY = y;
            // shifts bars upwards?
            // node.crisp = true;
        });
    }
    updateLabelSelection(selectionData) {
        const updateLabels = this.labelSelection.setData(selectionData);
        const enterLabels = updateLabels.enter.append(_Scene.Text).each((text) => {
            (text.tag = BarColumnNodeTag.Label), (text.pointerEvents = _Scene.PointerEvents.None);
        });
        updateLabels.exit.remove();
        this.labelSelection = updateLabels.merge(enterLabels);
    }
    updateLabelNodes() {
        const { label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color }, } = this;
        this.labelSelection.each((text, datum) => {
            const label = datum.label;
            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    }
    getTooltipHtml(datum) {
        const { dataType } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const content = this.formatNumericDatum(yValue);
        const title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        const defaults = {
            content,
            title,
        };
        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue,
                xValue,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    formatLabelValue(value) {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    }
}
