// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("./scene/group");
var selection_1 = require("./scene/selection");
var line_1 = require("./scene/shape/line");
var ticks_1 = require("./util/ticks");
var angle_1 = require("./util/angle");
var text_1 = require("./scene/shape/text");
var arc_1 = require("./scene/shape/arc");
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
var Axis = /** @class */ (function () {
    function Axis(scale) {
        this.group = new group_1.Group();
        this.line = new line_1.Line();
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
         * The padding between the ticks and the labels.
         */
        this.tickPadding = 5;
        /**
         * The color of the axis ticks.
         * Use `null` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
         */
        this.tickColor = 'rgba(195, 195, 195, 1)';
        /**
         * The font to be used by the labels. The given font string should use the
         * {@link https://www.w3.org/TR/CSS2/fonts.html#font-shorthand | font shorthand} notation.
         */
        this.labelFont = '12px Tahoma';
        /**
         * The color of the labels.
         * Use `null` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        this.labelColor = 'rgba(87, 87, 87, 1)';
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
        this._gridStyle = [{
                strokeStyle: 'rgba(219, 219, 219, 1)',
                lineDash: [4, 2]
            }];
        /**
         * `false` - render grid as lines of {@link gridLength} that extend the ticks
         *           on the opposite side of the axis
         * `true` - render grid as concentric circles that go through the ticks
         */
        this._radialGrid = false;
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
        this.scale = scale;
        this.groupSelection = selection_1.Selection.select(this.group).selectAll();
        this.group.append(this.line);
    }
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
    Object.defineProperty(Axis.prototype, "gridStyle", {
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
     * Supposed to be called manually after changing any of the axis properties.
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
        var group = this.group;
        var scale = this.scale;
        var rotation = angle_1.toRadians(this.rotation);
        var labelRotation = angle_1.normalizeAngle360(angle_1.toRadians(this.labelRotation));
        group.translationX = this.translationX;
        group.translationY = this.translationY;
        group.rotation = rotation;
        // Render ticks and labels.
        var ticks = scale.ticks(10);
        var decimalDigits = 0;
        if (ticks instanceof ticks_1.NumericTicks) {
            decimalDigits = ticks.decimalDigits;
        }
        var bandwidth = (scale.bandwidth || 0) / 2;
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
        var alignFlag = (labelRotation >= 0 && labelRotation <= Math.PI) ? -1 : 1;
        var parallelLabels = this.parallelLabels;
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
            .attrFn('translationY', function (node, datum) {
            return Math.round(scale.convert(datum) + bandwidth);
        });
        groupSelection.selectByTag(Tags.Tick)
            .each(function (line) {
            line.lineWidth = _this.tickWidth;
            line.strokeStyle = _this.tickColor;
        })
            .attr('x1', sideFlag * this.tickSize)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);
        if (this.gridLength) {
            var styles_1 = this.gridStyle;
            var styleCount_1 = styles_1.length;
            var gridLines = void 0;
            if (this.radialGrid) {
                var angularGridLength_1 = angle_1.normalizeAngle360Inclusive(angle_1.toRadians(this.gridLength));
                gridLines = groupSelection.selectByTag(Tags.GridLine)
                    .each(function (arc, datum) {
                    var radius = Math.round(scale.convert(datum) + bandwidth);
                    arc.centerX = 0;
                    arc.centerY = _this.scale.range[0] - radius;
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
                    line.visible = line.parent.translationY !== scale.range[0];
                });
            }
            gridLines.each(function (arc, datum, index) {
                var style = styles_1[index % styleCount_1];
                arc.strokeStyle = style.strokeStyle;
                arc.lineDash = style.lineDash;
                arc.fillStyle = null;
            });
        }
        var labels = groupSelection.selectByClass(text_1.Text)
            .each(function (label, datum) {
            label.font = _this.labelFont;
            label.fillStyle = _this.labelColor;
            label.textBaseline = parallelLabels && !labelRotation
                ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
                : 'middle';
            label.text = decimalDigits && typeof datum === 'number'
                ? datum.toFixed(decimalDigits)
                : datum.toString();
            label.textAlign = parallelLabels
                ? labelRotation ? (sideFlag * alignFlag === -1 ? 'end' : 'start') : 'center'
                : sideFlag * regularFlipFlag === -1 ? 'end' : 'start';
        });
        var labelX = sideFlag * (this.tickSize + this.tickPadding);
        var autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);
        labels
            .attr('x', labelX)
            .attr('rotationCenterX', labelX)
            .attr('rotation', autoRotation + labelRotation);
        this.groupSelection = groupSelection;
        // Render axis line.
        var line = this.line;
        line.x1 = 0;
        line.x2 = 0;
        line.y1 = scale.range[0];
        line.y2 = scale.range[scale.range.length - 1];
        line.lineWidth = this.lineWidth;
        line.strokeStyle = this.lineColor;
    };
    return Axis;
}());
exports.Axis = Axis;
