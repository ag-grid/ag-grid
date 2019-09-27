// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var selection_1 = require("../../scene/selection");
var line_1 = require("../../scene/shape/line");
var angle_1 = require("../../util/angle");
var text_1 = require("../../scene/shape/text");
var bbox_1 = require("../../scene/bbox");
var matrix_1 = require("../../scene/matrix");
var bandScale_1 = require("../../scale/bandScale");
var tree_1 = require("../../layout/tree");
var Tags;
(function (Tags) {
    Tags[Tags["Tick"] = 0] = "Tick";
    Tags[Tags["GridLine"] = 1] = "GridLine";
})(Tags || (Tags = {}));
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
var GroupedCategoryAxis = /** @class */ (function () {
    // onLayoutChange?: () => void;
    function GroupedCategoryAxis() {
        this.id = this.createId();
        this.scale = new bandScale_1.BandScale();
        this.tickScale = new bandScale_1.BandScale();
        this.group = new group_1.Group();
        /**
         * The horizontal translation of the axis group.
         */
        this.translationX = 0;
        /**
         * The vertical translation of the axis group.
         */
        this.translationY = 0;
        /**
         * Axis rotation angle in degrees.
         */
        this.rotation = 0;
        /**
         * The line width to be used by the axis line.
         */
        this.lineWidth = 1;
        /**
         * The color of the axis line.
         * Use `null` rather than `rgba(0, 0, 0, 0)` to make the axis line invisible.
         */
        this.lineColor = 'rgba(195, 195, 195, 1)';
        /**
         * The line width to be used by axis ticks.
         */
        this.tickWidth = 1;
        /**
         * The line length to be used by axis ticks.
         */
        this.tickSize = 6;
        /**
         * The padding between the labels and the axis line.
         */
        this.labelPadding = 5;
        this.labelGrid = false;
        /**
         * The color of the axis ticks.
         * Use `null` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
         */
        this.tickColor = 'rgba(195, 195, 195, 1)';
        this.labelFontStyle = '';
        this.labelFontWeight = '';
        this.labelFontSize = 12;
        this.labelFontFamily = 'Verdana, sans-serif';
        this.title = undefined;
        /**
         * The color of the labels.
         * Use `null` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        this.labelColor = 'rgba(87, 87, 87, 1)';
        /**
         * The length of the grid. The grid is only visible in case of a non-zero value.
         */
        this._gridLength = 0;
        /**
         * The array of styles to cycle through when rendering grid lines.
         * For example, use two {@link GridStyle} objects for alternating styles.
         * Contains only one {@link GridStyle} object by default, meaning all grid lines
         * have the same style.
         */
        this._gridStyle = [{
                stroke: 'rgba(219, 219, 219, 1)',
                lineDash: [4, 2]
            }];
        /**
         * Custom label rotation in degrees.
         * Labels are rendered perpendicular to the axis line by default.
         * Or parallel to the axis line, if the {@link parallelLabels} is set to `true`.
         * The value of this config is used as the angular offset/deflection
         * from the default rotation.
         */
        this.labelRotation = 0;
        /**
         * By default labels and ticks are positioned to the left of the axis line.
         * `true` positions the labels to the right of the axis line.
         * However, if the axis is rotated, its easier to think in terms
         * of this side or the opposite side, rather than left and right.
         * We use the term `mirror` for conciseness, although it's not
         * true mirroring - for example, when a label is rotated, so that
         * it is inclined at the 45 degree angle, text flowing from north-west
         * to south-east, ending at the tick to the left of the axis line,
         * and then we set this config to `true`, the text will still be flowing
         * from north-west to south-east, _starting_ at the tick to the right
         * of the axis line.
         */
        this.mirrorLabels = false;
        /**
         * Labels are rendered perpendicular to the axis line by default.
         * Setting this config to `true` makes labels render parallel to the axis line
         * and center aligns labels' text at the ticks.
         */
        this.parallelLabels = false;
        var scale = this.scale;
        scale.paddingOuter = 0.1;
        scale.paddingInner = scale.paddingOuter * 2;
        var tickScale = this.tickScale;
        tickScale.paddingInner = 1;
        tickScale.paddingOuter = 0;
        this.gridLineSelection = selection_1.Selection.select(this.group).selectAll();
        this.axisLineSelection = selection_1.Selection.select(this.group).selectAll();
        this.separatorSelection = selection_1.Selection.select(this.group).selectAll();
        this.labelSelection = selection_1.Selection.select(this.group).selectAll();
        // this.group.append(this.bboxRect); // debug (bbox)
    }
    GroupedCategoryAxis.prototype.createId = function () {
        var constructor = this.constructor;
        var className = constructor.className;
        if (!className) {
            throw new Error("The " + constructor + " is missing the 'className' property.");
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    };
    Object.defineProperty(GroupedCategoryAxis.prototype, "domain", {
        get: function () {
            return this.scale.domain;
        },
        set: function (value) {
            this.scale.domain = value;
            var tickTree = tree_1.ticksToTree(value);
            this.tickTreeLayout = tree_1.treeLayout(tickTree);
            var domain = value.slice();
            domain.push('');
            this.tickScale.domain = domain;
            this.resizeTickTree();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryAxis.prototype, "range", {
        get: function () {
            return this.scale.range;
        },
        set: function (value) {
            this.scale.range = value;
            this.tickScale.range = value;
            this.resizeTickTree();
        },
        enumerable: true,
        configurable: true
    });
    GroupedCategoryAxis.prototype.resizeTickTree = function () {
        var s = this.scale;
        var range = s.domain.length ? [s.convert(s.domain[0]), s.convert(s.domain[s.domain.length - 1])] : s.range;
        var layout = this.tickTreeLayout;
        var lineHeight = this.lineHeight;
        if (layout) {
            layout.resize(Math.abs(range[1] - range[0]), layout.depth * lineHeight, (Math.min(range[0], range[1]) || 0) + (s.bandwidth || 0) / 2, -layout.depth * lineHeight);
        }
    };
    Object.defineProperty(GroupedCategoryAxis.prototype, "lineHeight", {
        get: function () {
            return this.labelFontSize * 1.5;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryAxis.prototype, "gridLength", {
        get: function () {
            return this._gridLength;
        },
        set: function (value) {
            // Was visible and now invisible, or was invisible and now visible.
            if (this._gridLength && !value || !this._gridLength && value) {
                this.gridLineSelection = this.gridLineSelection.remove().setData([]);
                this.labelSelection = this.labelSelection.remove().setData([]);
            }
            this._gridLength = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryAxis.prototype, "gridStyle", {
        get: function () {
            return this._gridStyle;
        },
        set: function (value) {
            if (value.length) {
                this._gridStyle = value;
            }
        },
        enumerable: true,
        configurable: true
    });
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
    GroupedCategoryAxis.prototype.update = function () {
        var _this = this;
        var group = this.group;
        var scale = this.scale;
        var tickScale = this.tickScale;
        var bandwidth = Math.abs(scale.range[1] - scale.range[0]) / scale.domain.length || 0;
        var parallelLabels = this.parallelLabels;
        var rotation = angle_1.toRadians(this.rotation);
        var isHorizontal = Math.abs(Math.cos(rotation)) < 1e-8;
        var labelRotation = angle_1.normalizeAngle360(angle_1.toRadians(this.labelRotation));
        group.translationX = this.translationX;
        group.translationY = this.translationY;
        group.rotation = rotation;
        var title = this.title;
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
        var sideFlag = this.mirrorLabels ? 1 : -1;
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
        var parallelFlipFlag = (!labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI) ? -1 : 1;
        var regularFlipRotation = angle_1.normalizeAngle360(rotation - Math.PI / 2);
        // Flip if the axis rotation angle is in the top hemisphere.
        var regularFlipFlag = (!labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI) ? -1 : 1;
        var updateGridLines = this.gridLineSelection.setData(this.gridLength ? ticks : []);
        updateGridLines.exit.remove();
        var enterGridLines = updateGridLines.enter.append(line_1.Line);
        var gridLineSelection = updateGridLines.merge(enterGridLines);
        var updateLabels = this.labelSelection.setData(treeLabels);
        updateLabels.exit.remove();
        var enterLabels = updateLabels.enter.append(text_1.Text);
        var labelSelection = updateLabels.merge(enterLabels);
        var labelFormatter = this.labelFormatter;
        var maxLeafLabelWidth = 0;
        labelSelection
            .each(function (label, datum, index) {
            label.fontStyle = _this.labelFontStyle;
            label.fontWeight = _this.labelFontWeight;
            label.fontSize = _this.labelFontSize;
            label.fontFamily = _this.labelFontFamily;
            label.fill = _this.labelColor;
            label.textBaseline = parallelFlipFlag === -1 ? 'bottom' : 'hanging';
            // label.textBaseline = parallelLabels && !labelRotation
            //     ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
            //     : 'middle';
            if (title && index === 0) { // use the phantom root as the axis title
                label.text = title.text;
                label.fontSize = title.fontSize;
                label.fontStyle = title.fontStyle;
                label.fontWeight = title.fontWeight;
                label.fontFamily = title.fontFamily;
                label.textBaseline = 'hanging';
            }
            else {
                label.text = labelFormatter
                    ? labelFormatter({
                        value: String(datum.label),
                        index: index
                    })
                    : String(datum.label);
            }
            label.textAlign = 'center';
            label.translationX = datum.screenY - _this.labelFontSize * 0.25;
            label.translationY = datum.screenX;
            var bbox = label.getBBox();
            if (bbox && bbox.width > maxLeafLabelWidth) {
                maxLeafLabelWidth = bbox.width;
            }
        });
        var labelX = sideFlag * this.labelPadding; // label padding from the axis line
        var autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);
        var labelGrid = this.labelGrid;
        var separatorData = [];
        labelSelection.each(function (label, datum, index) {
            label.x = labelX;
            label.rotationCenterX = labelX;
            if (!datum.children.length) {
                label.rotation = labelRotation;
                label.textAlign = 'end';
                label.textBaseline = 'middle';
            }
            else {
                label.translationX -= maxLeafLabelWidth - lineHeight + _this.labelPadding;
                if (isHorizontal) {
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
                    : datum.screenX - datum.leafCount * bandwidth / 2;
                if (!datum.children.length) {
                    if (!datum.number || labelGrid) {
                        separatorData.push({
                            y: y,
                            x1: 0,
                            x2: -maxLeafLabelWidth - _this.labelPadding * 2,
                            toString: function () { return String(index); }
                        });
                    }
                }
                else {
                    separatorData.push({
                        y: y,
                        x1: -maxLeafLabelWidth + datum.screenY + lineHeight / 2,
                        x2: -maxLeafLabelWidth + datum.screenY - lineHeight / 2,
                        toString: function () { return String(index); }
                    });
                }
            }
        });
        // Calculate the position of the long separator on the far bottom of the axis.
        var minX = 0;
        separatorData.forEach(function (d) { return minX = Math.min(minX, d.x2); });
        separatorData.push({
            y: Math.max(scale.range[0], scale.range[1]),
            x1: 0,
            x2: minX,
            toString: function () { return String(separatorData.length); }
        });
        var updateSeparators = this.separatorSelection.setData(separatorData);
        updateSeparators.exit.remove();
        var enterSeparators = updateSeparators.enter.append(line_1.Line);
        var separatorSelection = updateSeparators.merge(enterSeparators);
        this.separatorSelection = separatorSelection;
        separatorSelection.each(function (line, datum, index) {
            line.x1 = datum.x1;
            line.x2 = datum.x2;
            line.y1 = datum.y;
            line.y2 = datum.y;
            line.stroke = _this.tickColor;
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
        axisLineSelection.each(function (line, datum, index) {
            var x = index > 0 ? -maxLeafLabelWidth - _this.labelPadding * 2 - (index - 1) * lineHeight : 0;
            line.x1 = x;
            line.x2 = x;
            line.y1 = scale.range[0];
            line.y2 = scale.range[1];
            line.strokeWidth = _this.lineWidth;
            line.stroke = _this.lineColor;
            line.visible = labels.length > 0 && (index === 0 || (labelGrid && isLabelTree));
        });
        if (this.gridLength) {
            var styles_1 = this.gridStyle;
            var styleCount_1 = styles_1.length;
            gridLineSelection
                .each(function (line, datum, index) {
                var y = Math.round(tickScale.convert(datum));
                line.x1 = 0;
                line.x2 = -sideFlag * _this.gridLength;
                line.y1 = y;
                line.y2 = y;
                line.visible = Math.abs(line.parent.translationY - scale.range[0]) > 1;
                var style = styles_1[index % styleCount_1];
                line.stroke = style.stroke;
                line.strokeWidth = _this.tickWidth;
                line.lineDash = style.lineDash;
                line.fill = undefined;
            });
        }
        // debug (bbox)
        // const bbox = this.getBBox();
        // const bboxRect = this.bboxRect;
        // bboxRect.x = bbox.x;
        // bboxRect.y = bbox.y;
        // bboxRect.width = bbox.width;
        // bboxRect.height = bbox.height;
    };
    GroupedCategoryAxis.prototype.getBBox = function (includeTitle) {
        if (includeTitle === void 0) { includeTitle = true; }
        var left = Infinity;
        var right = -Infinity;
        var top = Infinity;
        var bottom = -Infinity;
        this.labelSelection.each(function (label, datum, index) {
            // The label itself is rotated, but not translated, the group that
            // contains it is. So to capture the group transform in the label bbox
            // calculation we combine the transform matrices of the label and the group.
            // Depending on the timing of the `axis.getBBox()` method call, we may
            // not have the group's and the label's transform matrices updated yet (because
            // the transform matrix is not recalculated whenever a node's transform attributes
            // change, instead it's marked for recalculation on the next frame by setting
            // the node's `dirtyTransform` flag to `true`), so we force them to update
            // right here by calling `computeTransformMatrix`.
            if (index > 0 || includeTitle) { // first node is the root (title)
                label.computeTransformMatrix();
                var matrix = matrix_1.Matrix.flyweight(label.matrix);
                var group = label.parent;
                group.computeTransformMatrix();
                matrix.preMultiplySelf(group.matrix);
                var labelBBox = label.getBBox();
                if (labelBBox) {
                    var bbox = matrix.transformBBox(labelBBox);
                    left = Math.min(left, bbox.x);
                    right = Math.max(right, bbox.x + bbox.width);
                    top = Math.min(top, bbox.y);
                    bottom = Math.max(bottom, bbox.y + bbox.height);
                }
            }
        });
        return new bbox_1.BBox(left, top, right - left, bottom - top);
    };
    // debug (bbox)
    // private bboxRect = (() => {
    //     const rect = new Rect();
    //     rect.fill = undefined;
    //     rect.stroke = 'red';
    //     rect.strokeWidth = 1;
    //     rect.strokeOpacity = 0.7;
    //     return rect;
    // })();
    GroupedCategoryAxis.className = 'GroupedCategoryAxis';
    return GroupedCategoryAxis;
}());
exports.GroupedCategoryAxis = GroupedCategoryAxis;
