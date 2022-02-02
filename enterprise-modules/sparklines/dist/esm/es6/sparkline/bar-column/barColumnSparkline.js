import { Sparkline } from '../sparkline';
import { Group } from '../../scene/group';
import { Line } from '../../scene/shape/line';
import { Selection } from '../../scene/selection';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Rectangle } from './rectangle';
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';
import { Label } from '../label/label';
import { Text } from '../label/text';
import { PointerEvents } from '../../scene/node';
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
        this.axisLine = new Line();
        this.sparklineGroup = new Group();
        this.rectGroup = new Group();
        this.labelGroup = new Group();
        this.rectSelection = Selection.select(this.rectGroup).selectAll();
        this.labelSelection = Selection.select(this.labelGroup).selectAll();
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
    updateYScaleDomain() {
        const { yScale, yData, valueAxisDomain } = this;
        const yMinMax = extent(yData, isNumber);
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
        const enterRectSelection = updateRectSelection.enter.append(Rectangle);
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
        const enterLabels = updateLabels.enter.append(Text).each((text) => {
            (text.tag = BarColumnNodeTag.Label), (text.pointerEvents = PointerEvents.None);
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
//# sourceMappingURL=barColumnSparkline.js.map