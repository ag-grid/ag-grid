"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const selection_1 = require("../../scene/selection");
const line_1 = require("../../scene/shape/line");
const angle_1 = require("../../util/angle");
const text_1 = require("../../scene/shape/text");
const bandScale_1 = require("../../scale/bandScale");
const tree_1 = require("../../layout/tree");
const axis_1 = require("../../axis");
const chartAxis_1 = require("../chartAxis");
const array_1 = require("../../util/array");
const value_1 = require("../../util/value");
const validation_1 = require("../../util/validation");
class GroupedCategoryAxisLabel extends axis_1.AxisLabel {
    constructor() {
        super(...arguments);
        this.grid = false;
    }
}
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], GroupedCategoryAxisLabel.prototype, "grid", void 0);
class GroupedCategoryAxis extends chartAxis_1.ChartAxis {
    constructor() {
        super(new bandScale_1.BandScale());
        // Label scale (labels are positioned between ticks, tick count = label count + 1).
        // We don't call is `labelScale` for consistency with other axes.
        this.tickScale = new bandScale_1.BandScale();
        this.translation = {
            x: 0,
            y: 0,
        };
        this.line = new axis_1.AxisLine();
        this.label = new GroupedCategoryAxisLabel();
        /**
         * The color of the labels.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        this.labelColor = 'rgba(87, 87, 87, 1)';
        this.includeInvisibleDomains = true;
        const { axisGroup, gridlineGroup, tickScale, scale } = this;
        scale.paddingOuter = 0.1;
        scale.paddingInner = scale.paddingOuter * 2;
        this.requestedRange = scale.range.slice();
        this.refreshScale();
        tickScale.paddingInner = 1;
        tickScale.paddingOuter = 0;
        this.gridLineSelection = selection_1.Selection.select(gridlineGroup).selectAll();
        this.axisLineSelection = selection_1.Selection.select(axisGroup).selectAll();
        this.separatorSelection = selection_1.Selection.select(axisGroup).selectAll();
        this.labelSelection = selection_1.Selection.select(axisGroup).selectAll();
    }
    set range(value) {
        this.requestedRange = value.slice();
        this.updateRange();
    }
    get range() {
        return this.requestedRange.slice();
    }
    updateRange() {
        const { requestedRange: rr, visibleRange: vr, scale } = this;
        const span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        const shift = span * vr[0];
        const start = rr[0] - shift;
        this.tickScale.range = scale.range = [start, start + span];
        this.resizeTickTree();
    }
    resizeTickTree() {
        const s = this.scale;
        const range = s.domain.length ? [s.convert(s.domain[0]), s.convert(s.domain[s.domain.length - 1])] : s.range;
        const layout = this.tickTreeLayout;
        const lineHeight = this.lineHeight;
        if (layout) {
            layout.resize(Math.abs(range[1] - range[0]), layout.depth * lineHeight, (Math.min(range[0], range[1]) || 0) + (s.bandwidth || 0) / 2, -layout.depth * lineHeight, range[1] - range[0] < 0);
        }
    }
    get lineHeight() {
        return this.label.fontSize * 1.5;
    }
    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     */
    set gridLength(value) {
        // Was visible and now invisible, or was invisible and now visible.
        if ((this._gridLength && !value) || (!this._gridLength && value)) {
            this.gridLineSelection = this.gridLineSelection.remove().setData([]);
            this.labelSelection = this.labelSelection.remove().setData([]);
        }
        this._gridLength = value;
    }
    get gridLength() {
        return this._gridLength;
    }
    calculateDomain() {
        const { direction, boundSeries } = this;
        const domains = [];
        let isNumericX = undefined;
        boundSeries
            .filter((s) => s.visible)
            .forEach((series) => {
            if (direction === chartAxis_1.ChartAxisDirection.X) {
                if (isNumericX === undefined) {
                    // always add first X domain
                    const domain = series.getDomain(direction);
                    domains.push(domain);
                    isNumericX = typeof domain[0] === 'number';
                }
                else if (isNumericX) {
                    // only add further X domains if the axis is numeric
                    domains.push(series.getDomain(direction));
                }
            }
            else {
                domains.push(series.getDomain(direction));
            }
        });
        const domain = new Array().concat(...domains);
        const values = array_1.extent(domain, value_1.isContinuous) || domain;
        this.dataDomain = this.normaliseDataDomain(values);
    }
    normaliseDataDomain(d) {
        // Prevent duplicate categories.
        const values = d.filter((s, i, arr) => arr.indexOf(s) === i);
        const tickTree = tree_1.ticksToTree(values);
        this.tickTreeLayout = tree_1.treeLayout(tickTree);
        const tickScaleDomain = values.slice();
        tickScaleDomain.push('');
        this.tickScale.domain = tickScaleDomain;
        this.resizeTickTree();
        return values;
    }
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     * Supposed to be called _manually_ after changing _any_ of the axis properties.
     * This allows to bulk set axis properties before updating the nodes.
     * The node changes made by this method are rendered on the next animation frame.
     * We could schedule this method call automatically on the next animation frame
     * when any of the axis properties change (the way we do when properties of scene graph's
     * nodes change), but this will mean that we first wait for the next animation
     * frame to make changes to the nodes of the axis, then wait for another animation
     * frame to render those changes. It's nice to have everything update automatically,
     * but this extra level of async indirection will not just introduce an unwanted delay,
     * it will also make it harder to reason about the program.
     */
    update(primaryTickCount) {
        this.calculateDomain();
        const { scale, label, tickScale, requestedRange } = this;
        scale.domain = this.dataDomain;
        const rangeStart = scale.range[0];
        const rangeEnd = scale.range[1];
        const rangeLength = Math.abs(rangeEnd - rangeStart);
        const bandwidth = rangeLength / scale.domain.length || 0;
        const parallelLabels = label.parallel;
        const rotation = angle_1.toRadians(this.rotation);
        const isHorizontal = Math.abs(Math.cos(rotation)) < 1e-8;
        const labelRotation = this.label.rotation ? angle_1.normalizeAngle360(angle_1.toRadians(this.label.rotation)) : 0;
        this.updatePosition();
        const title = this.title;
        // The Text `node` of the Caption is not used to render the title of the grouped category axis.
        // The phantom root of the tree layout is used instead.
        if (title) {
            title.node.visible = false;
        }
        const lineHeight = this.lineHeight;
        // Render ticks and labels.
        const tickTreeLayout = this.tickTreeLayout;
        const labels = scale.ticks();
        const treeLabels = tickTreeLayout ? tickTreeLayout.nodes : [];
        const isLabelTree = tickTreeLayout ? tickTreeLayout.depth > 1 : false;
        const ticks = tickScale.ticks();
        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        const sideFlag = label.mirrored ? 1 : -1;
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        const parallelFlipRotation = angle_1.normalizeAngle360(rotation);
        const parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        const regularFlipRotation = angle_1.normalizeAngle360(rotation - Math.PI / 2);
        // Flip if the axis rotation angle is in the top hemisphere.
        const regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
        const updateGridLines = this.gridLineSelection.setData(this.gridLength ? ticks : []);
        updateGridLines.exit.remove();
        const enterGridLines = updateGridLines.enter.append(line_1.Line);
        const gridLineSelection = updateGridLines.merge(enterGridLines);
        const updateLabels = this.labelSelection.setData(treeLabels);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(text_1.Text);
        const labelSelection = updateLabels.merge(enterLabels);
        const labelFormatter = label.formatter;
        const labelBBoxes = new Map();
        let maxLeafLabelWidth = 0;
        labelSelection.each((node, datum, index) => {
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.textBaseline = parallelFlipFlag === -1 ? 'bottom' : 'hanging';
            node.textAlign = 'center';
            node.translationX = datum.screenY - label.fontSize * 0.25;
            node.translationY = datum.screenX;
            if (index === 0) {
                // use the phantom root as the axis title
                if (title && title.enabled && labels.length > 0) {
                    node.visible = true;
                    node.text = title.text;
                    node.fontSize = title.fontSize;
                    node.fontStyle = title.fontStyle;
                    node.fontWeight = title.fontWeight;
                    node.fontFamily = title.fontFamily;
                    node.textBaseline = 'hanging';
                }
                else {
                    node.visible = false;
                }
            }
            else {
                node.text = labelFormatter
                    ? labelFormatter({
                        value: String(datum.label),
                        index,
                    })
                    : String(datum.label);
                node.visible = datum.screenX >= requestedRange[0] && datum.screenX <= requestedRange[1];
            }
            const bbox = node.computeBBox();
            labelBBoxes.set(node.id, bbox);
            if (bbox.width > maxLeafLabelWidth) {
                maxLeafLabelWidth = bbox.width;
            }
        });
        const labelX = sideFlag * label.padding;
        const autoRotation = parallelLabels ? (parallelFlipFlag * Math.PI) / 2 : regularFlipFlag === -1 ? Math.PI : 0;
        const labelGrid = this.label.grid;
        const separatorData = [];
        labelSelection.each((label, datum, index) => {
            label.x = labelX;
            label.rotationCenterX = labelX;
            if (!datum.children.length) {
                label.rotation = labelRotation;
                label.textAlign = 'end';
                label.textBaseline = 'middle';
                const bbox = labelBBoxes.get(label.id);
                if (bbox && bbox.height > bandwidth) {
                    label.visible = false;
                }
            }
            else {
                label.translationX -= maxLeafLabelWidth - lineHeight + this.label.padding;
                const availableRange = datum.leafCount * bandwidth;
                const bbox = labelBBoxes.get(label.id);
                if (bbox && bbox.width > availableRange) {
                    label.visible = false;
                }
                else if (isHorizontal) {
                    label.rotation = autoRotation;
                }
                else {
                    label.rotation = -Math.PI / 2;
                }
            }
            // Calculate positions of label separators for all nodes except the root.
            // Each separator is placed to the top of the current label.
            if (datum.parent && isLabelTree) {
                let y = !datum.children.length
                    ? datum.screenX - bandwidth / 2
                    : datum.screenX - (datum.leafCount * bandwidth) / 2;
                if (!datum.children.length) {
                    if (datum.number !== datum.children.length - 1 || labelGrid) {
                        separatorData.push({
                            y,
                            x1: 0,
                            x2: -maxLeafLabelWidth - this.label.padding * 2,
                            toString: () => String(index),
                        });
                    }
                }
                else {
                    const x = -maxLeafLabelWidth - this.label.padding * 2 + datum.screenY;
                    separatorData.push({
                        y,
                        x1: x + lineHeight,
                        x2: x,
                        toString: () => String(index),
                    });
                }
            }
        });
        // Calculate the position of the long separator on the far bottom of the axis.
        let minX = 0;
        separatorData.forEach((d) => (minX = Math.min(minX, d.x2)));
        separatorData.push({
            y: Math.max(rangeStart, rangeEnd),
            x1: 0,
            x2: minX,
            toString: () => String(separatorData.length),
        });
        const updateSeparators = this.separatorSelection.setData(separatorData);
        updateSeparators.exit.remove();
        const enterSeparators = updateSeparators.enter.append(line_1.Line);
        const separatorSelection = updateSeparators.merge(enterSeparators);
        this.separatorSelection = separatorSelection;
        const epsilon = 0.0000001;
        separatorSelection.each((line, datum) => {
            line.x1 = datum.x1;
            line.x2 = datum.x2;
            line.y1 = datum.y;
            line.y2 = datum.y;
            line.visible = datum.y >= requestedRange[0] - epsilon && datum.y <= requestedRange[1] + epsilon;
            line.stroke = this.tick.color;
            line.fill = undefined;
            line.strokeWidth = 1;
        });
        this.gridLineSelection = gridLineSelection;
        this.labelSelection = labelSelection;
        // Render axis lines.
        const lineCount = tickTreeLayout ? tickTreeLayout.depth + 1 : 1;
        const lines = [];
        for (let i = 0; i < lineCount; i++) {
            lines.push(i);
        }
        const updateAxisLines = this.axisLineSelection.setData(lines);
        updateAxisLines.exit.remove();
        const enterAxisLines = updateAxisLines.enter.append(line_1.Line);
        const axisLineSelection = updateAxisLines.merge(enterAxisLines);
        this.axisLineSelection = axisLineSelection;
        axisLineSelection.each((line, _, index) => {
            const x = index > 0 ? -maxLeafLabelWidth - this.label.padding * 2 - (index - 1) * lineHeight : 0;
            line.x1 = x;
            line.x2 = x;
            line.y1 = requestedRange[0];
            line.y2 = requestedRange[1];
            line.strokeWidth = this.line.width;
            line.stroke = this.line.color;
            line.visible = labels.length > 0 && (index === 0 || (labelGrid && isLabelTree));
        });
        if (this.gridLength) {
            const styles = this.gridStyle;
            const styleCount = styles.length;
            gridLineSelection.each((line, datum, index) => {
                const y = Math.round(tickScale.convert(datum));
                line.x1 = 0;
                line.x2 = -sideFlag * this.gridLength;
                line.y1 = y;
                line.y2 = y;
                line.visible =
                    y >= requestedRange[0] &&
                        y <= requestedRange[1] &&
                        Math.abs(line.parent.translationY - rangeStart) > 1;
                const style = styles[index % styleCount];
                line.stroke = style.stroke;
                line.strokeWidth = this.tick.width;
                line.lineDash = style.lineDash;
                line.fill = undefined;
            });
        }
        return primaryTickCount;
    }
}
GroupedCategoryAxis.className = 'GroupedCategoryAxis';
GroupedCategoryAxis.type = 'groupedCategory';
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], GroupedCategoryAxis.prototype, "labelColor", void 0);
exports.GroupedCategoryAxis = GroupedCategoryAxis;
