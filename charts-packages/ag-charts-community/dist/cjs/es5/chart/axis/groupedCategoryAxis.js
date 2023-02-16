"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupedCategoryAxis = void 0;
var selection_1 = require("../../scene/selection");
var line_1 = require("../../scene/shape/line");
var angle_1 = require("../../util/angle");
var text_1 = require("../../scene/shape/text");
var bandScale_1 = require("../../scale/bandScale");
var tree_1 = require("../../layout/tree");
var axis_1 = require("../../axis");
var chartAxis_1 = require("../chartAxis");
var chartAxisDirection_1 = require("../chartAxisDirection");
var array_1 = require("../../util/array");
var validation_1 = require("../../util/validation");
var GroupedCategoryAxisLabel = /** @class */ (function (_super) {
    __extends(GroupedCategoryAxisLabel, _super);
    function GroupedCategoryAxisLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.grid = false;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], GroupedCategoryAxisLabel.prototype, "grid", void 0);
    return GroupedCategoryAxisLabel;
}(axis_1.AxisLabel));
var GroupedCategoryAxis = /** @class */ (function (_super) {
    __extends(GroupedCategoryAxis, _super);
    function GroupedCategoryAxis() {
        var _this = _super.call(this, new bandScale_1.BandScale()) || this;
        // Label scale (labels are positioned between ticks, tick count = label count + 1).
        // We don't call is `labelScale` for consistency with other axes.
        _this.tickScale = new bandScale_1.BandScale();
        _this.translation = {
            x: 0,
            y: 0,
        };
        _this.line = new axis_1.AxisLine();
        _this.label = new GroupedCategoryAxisLabel();
        /**
         * The color of the labels.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        _this.labelColor = 'rgba(87, 87, 87, 1)';
        _this.includeInvisibleDomains = true;
        var _a = _this, axisGroup = _a.axisGroup, gridlineGroup = _a.gridlineGroup, tickScale = _a.tickScale, scale = _a.scale;
        scale.paddingOuter = 0.1;
        scale.paddingInner = scale.paddingOuter * 2;
        _this.requestedRange = scale.range.slice();
        _this.refreshScale();
        tickScale.paddingInner = 1;
        tickScale.paddingOuter = 0;
        _this.gridLineSelection = selection_1.Selection.select(gridlineGroup).selectAll();
        _this.axisLineSelection = selection_1.Selection.select(axisGroup).selectAll();
        _this.separatorSelection = selection_1.Selection.select(axisGroup).selectAll();
        _this.labelSelection = selection_1.Selection.select(axisGroup).selectAll();
        return _this;
    }
    Object.defineProperty(GroupedCategoryAxis.prototype, "range", {
        get: function () {
            return this.requestedRange.slice();
        },
        set: function (value) {
            this.requestedRange = value.slice();
            this.updateRange();
        },
        enumerable: false,
        configurable: true
    });
    GroupedCategoryAxis.prototype.updateRange = function () {
        var _a = this, rr = _a.requestedRange, vr = _a.visibleRange, scale = _a.scale;
        var span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        var shift = span * vr[0];
        var start = rr[0] - shift;
        this.tickScale.range = scale.range = [start, start + span];
        this.resizeTickTree();
    };
    GroupedCategoryAxis.prototype.resizeTickTree = function () {
        var s = this.scale;
        var range = s.domain.length ? [s.convert(s.domain[0]), s.convert(s.domain[s.domain.length - 1])] : s.range;
        var layout = this.tickTreeLayout;
        var lineHeight = this.lineHeight;
        if (layout) {
            layout.resize(Math.abs(range[1] - range[0]), layout.depth * lineHeight, (Math.min(range[0], range[1]) || 0) + (s.bandwidth || 0) / 2, -layout.depth * lineHeight, range[1] - range[0] < 0);
        }
    };
    Object.defineProperty(GroupedCategoryAxis.prototype, "lineHeight", {
        get: function () {
            return this.label.fontSize * 1.5;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryAxis.prototype, "gridLength", {
        get: function () {
            return this._gridLength;
        },
        /**
         * The length of the grid. The grid is only visible in case of a non-zero value.
         */
        set: function (value) {
            // Was visible and now invisible, or was invisible and now visible.
            if ((this._gridLength && !value) || (!this._gridLength && value)) {
                this.gridLineSelection = this.gridLineSelection.remove().setData([]);
                this.labelSelection = this.labelSelection.remove().setData([]);
            }
            this._gridLength = value;
        },
        enumerable: false,
        configurable: true
    });
    GroupedCategoryAxis.prototype.calculateDomain = function () {
        var _a;
        var _b = this, direction = _b.direction, boundSeries = _b.boundSeries;
        var domains = [];
        var isNumericX = undefined;
        boundSeries
            .filter(function (s) { return s.visible; })
            .forEach(function (series) {
            if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
                if (isNumericX === undefined) {
                    // always add first X domain
                    var domain_1 = series.getDomain(direction);
                    domains.push(domain_1);
                    isNumericX = typeof domain_1[0] === 'number';
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
        var domain = (_a = new Array()).concat.apply(_a, __spread(domains));
        var values = array_1.extent(domain) || domain;
        this.dataDomain = this.normaliseDataDomain(values);
    };
    GroupedCategoryAxis.prototype.normaliseDataDomain = function (d) {
        // Prevent duplicate categories.
        var values = d.filter(function (s, i, arr) { return arr.indexOf(s) === i; });
        var tickTree = tree_1.ticksToTree(values);
        this.tickTreeLayout = tree_1.treeLayout(tickTree);
        var tickScaleDomain = values.slice();
        tickScaleDomain.push('');
        this.tickScale.domain = tickScaleDomain;
        this.resizeTickTree();
        return values;
    };
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
    GroupedCategoryAxis.prototype.update = function (primaryTickCount) {
        var _this = this;
        this.calculateDomain();
        var _a = this, scale = _a.scale, label = _a.label, tickScale = _a.tickScale, requestedRange = _a.requestedRange;
        scale.domain = this.dataDomain;
        var rangeStart = scale.range[0];
        var rangeEnd = scale.range[1];
        var rangeLength = Math.abs(rangeEnd - rangeStart);
        var bandwidth = rangeLength / scale.domain.length || 0;
        var parallelLabels = label.parallel;
        var rotation = angle_1.toRadians(this.rotation);
        var isHorizontal = Math.abs(Math.cos(rotation)) < 1e-8;
        var labelRotation = this.label.rotation ? angle_1.normalizeAngle360(angle_1.toRadians(this.label.rotation)) : 0;
        this.updatePosition();
        var title = this.title;
        // The Text `node` of the Caption is not used to render the title of the grouped category axis.
        // The phantom root of the tree layout is used instead.
        if (title) {
            title.node.visible = false;
        }
        var lineHeight = this.lineHeight;
        // Render ticks and labels.
        var tickTreeLayout = this.tickTreeLayout;
        var labels = scale.ticks();
        var treeLabels = tickTreeLayout ? tickTreeLayout.nodes : [];
        var isLabelTree = tickTreeLayout ? tickTreeLayout.depth > 1 : false;
        var ticks = tickScale.ticks();
        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        var sideFlag = label.mirrored ? 1 : -1;
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        var parallelFlipRotation = angle_1.normalizeAngle360(rotation);
        var parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        var regularFlipRotation = angle_1.normalizeAngle360(rotation - Math.PI / 2);
        // Flip if the axis rotation angle is in the top hemisphere.
        var regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
        var updateGridLines = this.gridLineSelection.setData(this.gridLength ? ticks : []);
        updateGridLines.exit.remove();
        var enterGridLines = updateGridLines.enter.append(line_1.Line);
        var gridLineSelection = updateGridLines.merge(enterGridLines);
        var updateLabels = this.labelSelection.setData(treeLabels);
        updateLabels.exit.remove();
        var enterLabels = updateLabels.enter.append(text_1.Text);
        var labelSelection = updateLabels.merge(enterLabels);
        var labelFormatter = label.formatter;
        var labelBBoxes = new Map();
        var maxLeafLabelWidth = 0;
        labelSelection.each(function (node, datum, index) {
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
                        index: index,
                    })
                    : String(datum.label);
                node.visible = datum.screenX >= requestedRange[0] && datum.screenX <= requestedRange[1];
            }
            var bbox = node.computeBBox();
            labelBBoxes.set(node.id, bbox);
            if (bbox.width > maxLeafLabelWidth) {
                maxLeafLabelWidth = bbox.width;
            }
        });
        var labelX = sideFlag * label.padding;
        var autoRotation = parallelLabels ? (parallelFlipFlag * Math.PI) / 2 : regularFlipFlag === -1 ? Math.PI : 0;
        var labelGrid = this.label.grid;
        var separatorData = [];
        labelSelection.each(function (label, datum, index) {
            label.x = labelX;
            label.rotationCenterX = labelX;
            if (!datum.children.length) {
                label.rotation = labelRotation;
                label.textAlign = 'end';
                label.textBaseline = 'middle';
                var bbox = labelBBoxes.get(label.id);
                if (bbox && bbox.height > bandwidth) {
                    label.visible = false;
                }
            }
            else {
                label.translationX -= maxLeafLabelWidth - lineHeight + _this.label.padding;
                var availableRange = datum.leafCount * bandwidth;
                var bbox = labelBBoxes.get(label.id);
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
                var y = !datum.children.length
                    ? datum.screenX - bandwidth / 2
                    : datum.screenX - (datum.leafCount * bandwidth) / 2;
                if (!datum.children.length) {
                    if (datum.number !== datum.children.length - 1 || labelGrid) {
                        separatorData.push({
                            y: y,
                            x1: 0,
                            x2: -maxLeafLabelWidth - _this.label.padding * 2,
                            toString: function () { return String(index); },
                        });
                    }
                }
                else {
                    var x = -maxLeafLabelWidth - _this.label.padding * 2 + datum.screenY;
                    separatorData.push({
                        y: y,
                        x1: x + lineHeight,
                        x2: x,
                        toString: function () { return String(index); },
                    });
                }
            }
        });
        // Calculate the position of the long separator on the far bottom of the axis.
        var minX = 0;
        separatorData.forEach(function (d) { return (minX = Math.min(minX, d.x2)); });
        separatorData.push({
            y: Math.max(rangeStart, rangeEnd),
            x1: 0,
            x2: minX,
            toString: function () { return String(separatorData.length); },
        });
        var updateSeparators = this.separatorSelection.setData(separatorData);
        updateSeparators.exit.remove();
        var enterSeparators = updateSeparators.enter.append(line_1.Line);
        var separatorSelection = updateSeparators.merge(enterSeparators);
        this.separatorSelection = separatorSelection;
        var epsilon = 0.0000001;
        separatorSelection.each(function (line, datum) {
            line.x1 = datum.x1;
            line.x2 = datum.x2;
            line.y1 = datum.y;
            line.y2 = datum.y;
            line.visible = datum.y >= requestedRange[0] - epsilon && datum.y <= requestedRange[1] + epsilon;
            line.stroke = _this.tick.color;
            line.fill = undefined;
            line.strokeWidth = 1;
        });
        this.gridLineSelection = gridLineSelection;
        this.labelSelection = labelSelection;
        // Render axis lines.
        var lineCount = tickTreeLayout ? tickTreeLayout.depth + 1 : 1;
        var lines = [];
        for (var i = 0; i < lineCount; i++) {
            lines.push(i);
        }
        var updateAxisLines = this.axisLineSelection.setData(lines);
        updateAxisLines.exit.remove();
        var enterAxisLines = updateAxisLines.enter.append(line_1.Line);
        var axisLineSelection = updateAxisLines.merge(enterAxisLines);
        this.axisLineSelection = axisLineSelection;
        axisLineSelection.each(function (line, _, index) {
            var x = index > 0 ? -maxLeafLabelWidth - _this.label.padding * 2 - (index - 1) * lineHeight : 0;
            line.x1 = x;
            line.x2 = x;
            line.y1 = requestedRange[0];
            line.y2 = requestedRange[1];
            line.strokeWidth = _this.line.width;
            line.stroke = _this.line.color;
            line.visible = labels.length > 0 && (index === 0 || (labelGrid && isLabelTree));
        });
        if (this.gridLength) {
            var styles_1 = this.gridStyle;
            var styleCount_1 = styles_1.length;
            gridLineSelection.each(function (line, datum, index) {
                var y = Math.round(tickScale.convert(datum));
                line.x1 = 0;
                line.x2 = -sideFlag * _this.gridLength;
                line.y1 = y;
                line.y2 = y;
                line.visible =
                    y >= requestedRange[0] &&
                        y <= requestedRange[1] &&
                        Math.abs(line.parent.translationY - rangeStart) > 1;
                var style = styles_1[index % styleCount_1];
                line.stroke = style.stroke;
                line.strokeWidth = _this.tick.width;
                line.lineDash = style.lineDash;
                line.fill = undefined;
            });
        }
        return primaryTickCount;
    };
    GroupedCategoryAxis.className = 'GroupedCategoryAxis';
    GroupedCategoryAxis.type = 'groupedCategory';
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], GroupedCategoryAxis.prototype, "labelColor", void 0);
    return GroupedCategoryAxis;
}(chartAxis_1.ChartAxis));
exports.GroupedCategoryAxis = GroupedCategoryAxis;
