"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("./scene/group");
var selection_1 = require("./scene/selection");
var line_1 = require("./scene/shape/line");
var angle_1 = require("./util/angle");
var text_1 = require("./scene/shape/text");
var arc_1 = require("./scene/shape/arc");
var bbox_1 = require("./scene/bbox");
var matrix_1 = require("./scene/matrix");
// import { Rect } from "./scene/shape/rect"; // debug (bbox)
var Tags;
(function (Tags) {
    Tags[Tags["Tick"] = 0] = "Tick";
    Tags[Tags["GridLine"] = 1] = "GridLine";
})(Tags || (Tags = {}));
var AxisTick = /** @class */ (function () {
    function AxisTick() {
        /**
         * The line width to be used by axis ticks.
         */
        this.width = 1;
        /**
         * The line length to be used by axis ticks.
         */
        this.size = 6;
        /**
         * The color of the axis ticks.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
         */
        this.color = 'rgba(195, 195, 195, 1)';
        /**
         * A hint of how many ticks to use (the exact number of ticks might differ),
         * a `TimeInterval` or a `CountableTimeInterval`.
         * For example:
         *
         *     axis.tick.count = 5;
         *     axis.tick.count = year;
         *     axis.tick.count = month.every(6);
         */
        this.count = 10;
    }
    return AxisTick;
}());
exports.AxisTick = AxisTick;
var AxisLabel = /** @class */ (function () {
    function AxisLabel() {
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        /**
         * The padding between the labels and the ticks.
         */
        this.padding = 5;
        /**
         * The color of the labels.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        this.color = 'rgba(87, 87, 87, 1)';
        /**
         * Custom label rotation in degrees.
         * Labels are rendered perpendicular to the axis line by default.
         * Or parallel to the axis line, if the {@link parallelLabels} is set to `true`.
         * The value of this config is used as the angular offset/deflection
         * from the default rotation.
         */
        this.rotation = 0;
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
        this.mirrored = false;
        /**
         * Labels are rendered perpendicular to the axis line by default.
         * Setting this config to `true` makes labels render parallel to the axis line
         * and center aligns labels' text at the ticks.
         */
        this.parallel = false;
    }
    Object.defineProperty(AxisLabel.prototype, "format", {
        get: function () {
            return this._format;
        },
        set: function (value) {
            // See `TimeLocaleObject` docs for the list of supported format directives.
            if (this._format !== value) {
                this._format = value;
                if (this.onFormatChange) {
                    this.onFormatChange(value);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    return AxisLabel;
}());
exports.AxisLabel = AxisLabel;
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
var Axis = /** @class */ (function () {
    function Axis(scale) {
        this.lineNode = new line_1.Line();
        this.group = new group_1.Group();
        this.line = {
            width: 1,
            color: 'rgba(195, 195, 195, 1)'
        };
        this.tick = new AxisTick();
        this.label = new AxisLabel();
        this.translation = { x: 0, y: 0 };
        this.rotation = 0; // axis rotation angle in degrees
        this._visibleRange = [0, 1];
        this._title = undefined;
        /**
         * The length of the grid. The grid is only visible in case of a non-zero value.
         * In case {@link radialGrid} is `true`, the value is interpreted as an angle
         * (in degrees).
         */
        this._gridLength = 0;
        /**
         * The array of styles to cycle through when rendering grid lines.
         * For example, use two {@link GridStyle} objects for alternating styles.
         * Contains only one {@link GridStyle} object by default, meaning all grid lines
         * have the same style.
         */
        this.gridStyle = [{
                stroke: 'rgba(219, 219, 219, 1)',
                lineDash: [4, 2]
            }];
        /**
         * `false` - render grid as lines of {@link gridLength} that extend the ticks
         *           on the opposite side of the axis
         * `true` - render grid as concentric circles that go through the ticks
         */
        this._radialGrid = false;
        this.scale = scale;
        this.requestedRange = scale.range.slice();
        this.groupSelection = selection_1.Selection.select(this.group).selectAll();
        this.label.onFormatChange = this.onTickFormatChange.bind(this);
        this.group.append(this.lineNode);
        this.onTickFormatChange();
        // this.group.append(this.bboxRect); // debug (bbox)
    }
    Axis.prototype.updateRange = function () {
        var _a = this, rr = _a.requestedRange, vr = _a.visibleRange, scale = _a.scale;
        var span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        var shift = span * vr[0];
        var start = rr[0] - shift;
        scale.range = [start, start + span];
    };
    Object.defineProperty(Axis.prototype, "range", {
        get: function () {
            return this.requestedRange.slice();
        },
        set: function (value) {
            this.requestedRange = value.slice();
            this.updateRange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "visibleRange", {
        get: function () {
            return this._visibleRange.slice();
        },
        set: function (value) {
            if (value && value.length === 2) {
                var min = value[0], max = value[1];
                min = Math.max(0, min);
                max = Math.min(1, max);
                min = Math.min(min, max);
                max = Math.max(min, max);
                this._visibleRange = [min, max];
                this.updateRange();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "domain", {
        get: function () {
            return this.scale.domain.slice();
        },
        set: function (value) {
            this.scale.domain = value.slice();
        },
        enumerable: true,
        configurable: true
    });
    Axis.prototype.onTickFormatChange = function (format) {
        if (format) {
            if (this.scale.tickFormat) {
                this.tickFormatter = this.scale.tickFormat(10, format);
            }
        }
        else {
            if (this.scale.tickFormat) {
                this.tickFormatter = this.scale.tickFormat(10, undefined);
            }
            else {
                this.tickFormatter = undefined;
            }
        }
    };
    Object.defineProperty(Axis.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            var oldTitle = this._title;
            if (oldTitle !== value) {
                if (oldTitle) {
                    this.group.removeChild(oldTitle.node);
                }
                if (value) {
                    value.node.rotation = -Math.PI / 2;
                    this.group.appendChild(value.node);
                }
                this._title = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "gridLength", {
        get: function () {
            return this._gridLength;
        },
        set: function (value) {
            // Was visible and now invisible, or was invisible and now visible.
            if (this._gridLength && !value || !this._gridLength && value) {
                this.groupSelection = this.groupSelection.remove().setData([]);
            }
            this._gridLength = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "radialGrid", {
        get: function () {
            return this._radialGrid;
        },
        set: function (value) {
            if (this._radialGrid !== value) {
                this._radialGrid = value;
                this.groupSelection = this.groupSelection.remove().setData([]);
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
    Axis.prototype.update = function () {
        var _this = this;
        var _a = this, group = _a.group, scale = _a.scale, tick = _a.tick, label = _a.label, gridStyle = _a.gridStyle, requestedRange = _a.requestedRange;
        var requestedRangeMin = Math.min(requestedRange[0], requestedRange[1]);
        var requestedRangeMax = Math.max(requestedRange[0], requestedRange[1]);
        var rotation = angle_1.toRadians(this.rotation);
        var parallelLabels = label.parallel;
        var labelRotation = angle_1.normalizeAngle360(angle_1.toRadians(label.rotation));
        group.translationX = this.translation.x;
        group.translationY = this.translation.y;
        group.rotation = rotation;
        var halfBandwidth = (scale.bandwidth || 0) / 2;
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
        var alignFlag = labelRotation >= 0 && labelRotation <= Math.PI ? -1 : 1;
        var ticks = scale.ticks(this.tick.count);
        var update = this.groupSelection.setData(ticks);
        update.exit.remove();
        var enter = update.enter.append(group_1.Group);
        // Line auto-snaps to pixel grid if vertical or horizontal.
        enter.append(line_1.Line).each(function (node) { return node.tag = Tags.Tick; });
        if (this.gridLength) {
            if (this.radialGrid) {
                enter.append(arc_1.Arc).each(function (node) { return node.tag = Tags.GridLine; });
            }
            else {
                enter.append(line_1.Line).each(function (node) { return node.tag = Tags.GridLine; });
            }
        }
        enter.append(text_1.Text);
        var groupSelection = update.merge(enter);
        groupSelection
            .attrFn('translationY', function (_, datum) {
            return Math.round(scale.convert(datum) + halfBandwidth);
        })
            .attrFn('visible', function (node) {
            return node.translationY >= requestedRangeMin && node.translationY <= requestedRangeMax;
        });
        groupSelection.selectByTag(Tags.Tick)
            .each(function (line) {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
        })
            .attr('x1', sideFlag * tick.size)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);
        if (this.gridLength && gridStyle.length) {
            var styleCount_1 = gridStyle.length;
            var gridLines = void 0;
            if (this.radialGrid) {
                var angularGridLength_1 = angle_1.normalizeAngle360Inclusive(angle_1.toRadians(this.gridLength));
                gridLines = groupSelection.selectByTag(Tags.GridLine)
                    .each(function (arc, datum) {
                    var radius = Math.round(scale.convert(datum) + halfBandwidth);
                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength_1;
                    arc.radiusX = radius;
                    arc.radiusY = radius;
                });
            }
            else {
                gridLines = groupSelection.selectByTag(Tags.GridLine)
                    .each(function (line) {
                    line.x1 = 0;
                    line.x2 = -sideFlag * _this.gridLength;
                    line.y1 = 0;
                    line.y2 = 0;
                    line.visible = Math.abs(line.parent.translationY - scale.range[0]) > 1;
                });
            }
            gridLines.each(function (gridLine, _, index) {
                var style = gridStyle[index % styleCount_1];
                gridLine.stroke = style.stroke;
                gridLine.strokeWidth = tick.width;
                gridLine.lineDash = style.lineDash;
                gridLine.fill = undefined;
            });
        }
        var tickFormatter = this.tickFormatter;
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        var fractionDigits = ticks.fractionDigits >= 0 ? ticks.fractionDigits : 0;
        var labelSelection = groupSelection.selectByClass(text_1.Text)
            .each(function (node, datum, index) {
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.textBaseline = parallelLabels && !labelRotation
                ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
                : 'middle';
            node.text = label.formatter
                ? label.formatter({
                    value: fractionDigits >= 0 ? datum : String(datum),
                    index: index,
                    fractionDigits: fractionDigits,
                    formatter: tickFormatter
                })
                : fractionDigits
                    // the `datum` is a floating point number
                    ? datum.toFixed(fractionDigits)
                    // the `datum` is an integer, a string or an object
                    : tickFormatter
                        ? tickFormatter(datum)
                        : String(datum);
            node.textAlign = parallelLabels
                ? labelRotation ? (sideFlag * alignFlag === -1 ? 'end' : 'start') : 'center'
                : sideFlag * regularFlipFlag === -1 ? 'end' : 'start';
        });
        var labelX = sideFlag * (tick.size + label.padding);
        var autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);
        labelSelection.each(function (label) {
            label.x = labelX;
            label.rotationCenterX = labelX;
            label.rotation = autoRotation + labelRotation;
        });
        this.groupSelection = groupSelection;
        // Render axis line.
        var lineNode = this.lineNode;
        lineNode.x1 = 0;
        lineNode.x2 = 0;
        lineNode.y1 = requestedRange[0];
        lineNode.y2 = requestedRange[1];
        lineNode.strokeWidth = this.line.width;
        lineNode.stroke = this.line.color;
        lineNode.visible = ticks.length > 0;
        var title = this.title;
        var titleVisible = false;
        if (title && title.enabled) {
            titleVisible = true;
            var padding = title.padding.bottom;
            var titleNode = title.node;
            var bbox = this.computeBBox({ excludeTitle: true });
            var titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = titleRotationFlag * sideFlag * Math.PI / 2;
            titleNode.x = titleRotationFlag * sideFlag * (lineNode.y1 + lineNode.y2) / 2;
            titleNode.x = titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1]) / 2;
            if (sideFlag === -1) {
                titleNode.y = titleRotationFlag * (-padding - bbox.width + Math.max(bbox.x + bbox.width, 0));
            }
            else {
                titleNode.y = -padding - bbox.width - Math.min(bbox.x, 0);
            }
            // title.text = `Axis Title: ${sideFlag} ${toDegrees(parallelFlipRotation).toFixed(0)} ${titleRotationFlag}`;
            titleNode.textBaseline = titleRotationFlag === 1 ? 'bottom' : 'top';
        }
        if (title) {
            title.node.visible = titleVisible;
        }
        // debug (bbox)
        // const bbox = this.computeBBox();
        // const bboxRect = this.bboxRect;
        // bboxRect.x = bbox.x;
        // bboxRect.y = bbox.y;
        // bboxRect.width = bbox.width;
        // bboxRect.height = bbox.height;
    };
    Axis.prototype.computeBBox = function (options) {
        var _a = this, title = _a.title, lineNode = _a.lineNode;
        var labels = this.groupSelection.selectByClass(text_1.Text);
        var left = Infinity;
        var right = -Infinity;
        var top = Infinity;
        var bottom = -Infinity;
        labels.each(function (label) {
            // The label itself is rotated, but not translated, the group that
            // contains it is. So to capture the group transform in the label bbox
            // calculation we combine the transform matrices of the label and the group.
            // Depending on the timing of the `axis.computeBBox()` method call, we may
            // not have the group's and the label's transform matrices updated yet (because
            // the transform matrix is not recalculated whenever a node's transform attributes
            // change, instead it's marked for recalculation on the next frame by setting
            // the node's `dirtyTransform` flag to `true`), so we force them to update
            // right here by calling `computeTransformMatrix`.
            label.computeTransformMatrix();
            var matrix = matrix_1.Matrix.flyweight(label.matrix);
            var group = label.parent;
            group.computeTransformMatrix();
            matrix.preMultiplySelf(group.matrix);
            var labelBBox = label.computeBBox();
            if (labelBBox) {
                var bbox = matrix.transformBBox(labelBBox);
                left = Math.min(left, bbox.x);
                right = Math.max(right, bbox.x + bbox.width);
                top = Math.min(top, bbox.y);
                bottom = Math.max(bottom, bbox.y + bbox.height);
            }
        });
        if (title && title.enabled && (!options || !options.excludeTitle)) {
            var label = title.node;
            label.computeTransformMatrix();
            var matrix = matrix_1.Matrix.flyweight(label.matrix);
            var labelBBox = label.computeBBox();
            if (labelBBox) {
                var bbox = matrix.transformBBox(labelBBox);
                left = Math.min(left, bbox.x);
                right = Math.max(right, bbox.x + bbox.width);
                top = Math.min(top, bbox.y);
                bottom = Math.max(bottom, bbox.y + bbox.height);
            }
        }
        left = Math.min(left, 0);
        right = Math.max(right, 0);
        top = Math.min(top, lineNode.y1, lineNode.y2);
        bottom = Math.max(bottom, lineNode.y1, lineNode.y2);
        return new bbox_1.BBox(left, top, right - left, bottom - top);
    };
    return Axis;
}());
exports.Axis = Axis;
//# sourceMappingURL=axis.js.map