import { _Scene, _Util } from 'ag-charts-community';
import { Sparkline, ZINDICIES } from '../sparkline';
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
        this.rectSelection = _Scene.Selection.select(this.rectGroup, _Scene.Rect);
        this.labelSelection = _Scene.Selection.select(this.labelGroup, _Scene.Text);
        this.nodeSelectionData = [];
        this.label = new BarColumnLabel();
        this.rootGroup.append(this.sparklineGroup);
        this.rectGroup.zIndex = ZINDICIES.SERIES_FILL_ZINDEX;
        this.axisLine.zIndex = ZINDICIES.AXIS_LINE_ZINDEX;
        this.labelGroup.zIndex = ZINDICIES.SERIES_LABEL_ZINDEX;
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
        let intervals = domainLength / ((_a = smallestInterval === null || smallestInterval === void 0 ? void 0 : smallestInterval.x) !== null && _a !== void 0 ? _a : 1) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum of 50 bands to ensure the step (width of individual bands + padding) does not fall below a certain number of pixels.
        // If the number of intervals exceeds 50, calculate the step for 50 bands within the given range.
        // This means there could be some overlap of the bands in the sparkline.
        const maxBands = 50;
        const bands = Math.min(intervals, maxBands);
        const gaps = bands - 1; // number of gaps (padding between bands)
        const step = range / Math.max(1, 2 * paddingOuter + gaps * paddingInner + bands); // step width is a combination of band width and gap width
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
        this.rectSelection.update(selectionData);
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
        this.labelSelection.update(selectionData, (text) => {
            text.tag = BarColumnNodeTag.Label;
            text.pointerEvents = _Scene.PointerEvents.None;
        });
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
        var _a, _b;
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
        const tooltipRenderer = (_b = (_a = this.processedOptions) === null || _a === void 0 ? void 0 : _a.tooltip) === null || _b === void 0 ? void 0 : _b.renderer;
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyQ29sdW1uU3BhcmtsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NwYXJrbGluZS9iYXItY29sdW1uL2JhckNvbHVtblNwYXJrbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQXlCLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUzRSxPQUFPLEVBQW1CLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2QyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBd0J6QixJQUFLLGdCQUdKO0FBSEQsV0FBSyxnQkFBZ0I7SUFDakIsdURBQUksQ0FBQTtJQUNKLHlEQUFLLENBQUE7QUFDVCxDQUFDLEVBSEksZ0JBQWdCLEtBQWhCLGdCQUFnQixRQUdwQjtBQUVELE1BQU0sQ0FBTixJQUFZLHVCQUtYO0FBTEQsV0FBWSx1QkFBdUI7SUFDL0Isb0RBQXlCLENBQUE7SUFDekIsa0RBQXVCLENBQUE7SUFDdkIsNENBQWlCLENBQUE7SUFDakIsb0RBQXlCLENBQUE7QUFDN0IsQ0FBQyxFQUxXLHVCQUF1QixLQUF2Qix1QkFBdUIsUUFLbEM7QUFFRCxNQUFNLE9BQU8sY0FBZSxTQUFRLEtBQUs7SUFBekM7O1FBQ0ksY0FBUyxHQUF1RCxTQUFTLENBQUM7UUFDMUUsY0FBUyxHQUFHLHVCQUF1QixDQUFDLFNBQVMsQ0FBQztJQUNsRCxDQUFDO0NBQUE7QUFFRCxNQUFNLE9BQWdCLGtCQUFtQixTQUFRLFNBQVM7SUE2QnREO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUE3QlosU0FBSSxHQUFXLG9CQUFvQixDQUFDO1FBQ3BDLFdBQU0sR0FBVyxRQUFRLENBQUM7UUFDMUIsZ0JBQVcs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