// ag-grid-enterprise v20.1.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("./scene/group");
var selection_1 = require("./scene/selection");
var line_1 = require("./scene/shape/line");
var ticks_1 = require("./util/ticks");
var angle_1 = require("./util/angle");
var text_1 = require("./scene/shape/text");
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be rotated by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 */
var Axis = /** @class */ (function () {
    function Axis(scale, group) {
        this.line = new line_1.Line();
        this.translationX = 0;
        this.translationY = 0;
        this.rotation = 0; // in degrees
        this.lineWidth = 1;
        this.tickWidth = 1;
        this.tickSize = 6;
        this.tickPadding = 5;
        this.lineColor = 'black';
        this.tickColor = 'black';
        this.labelFont = '14px Verdana';
        this.labelColor = 'black';
        /**
         * Custom label rotation in degrees.
         * Labels are rendered perpendicular to the axis line by default.
         * Or parallel to the axis line, if the {@link isParallelLabels} is set to `true`.
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
        this.isMirrorLabels = false;
        /**
         * Labels are rendered perpendicular to the axis line by default.
         * Setting this config to `true` makes labels render parallel to the axis line
         * and center aligns labels' text at the ticks.
         * If the axis is rotated so that it is horizontal (by +/- 90 degrees),
         * the labels rotate with it and become vertical,
         */
        this.isParallelLabels = false;
        this.scale = scale;
        this.group = group;
        this.groupSelection = selection_1.Selection.select(group).selectAll();
        group.append(this.line);
    }
    Axis.prototype.render = function () {
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
        var sideFlag = this.isMirrorLabels ? 1 : -1;
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
        var isParallelLabels = this.isParallelLabels;
        var update = this.groupSelection.setData(ticks);
        update.exit.remove();
        var enter = update.enter.append(group_1.Group);
        enter.append(line_1.Line); // auto-snaps to pixel grid if vertical or horizontal
        enter.append(text_1.Text);
        var groupSelection = update.merge(enter);
        groupSelection
            .attrFn('translationY', function (node, datum) {
            return Math.round(scale.convert(datum) + bandwidth);
        });
        groupSelection.selectByClass(line_1.Line)
            .each(function (node) {
            node.lineWidth = _this.tickWidth;
            node.strokeStyle = _this.tickColor;
        })
            .attr('x1', sideFlag * this.tickSize)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);
        var labels = groupSelection.selectByClass(text_1.Text)
            .each(function (label, datum) {
            label.font = _this.labelFont;
            label.fillStyle = _this.labelColor;
            label.textBaseline = isParallelLabels && !labelRotation
                ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
                : 'middle';
            label.text = decimalDigits && typeof datum === 'number'
                ? datum.toFixed(decimalDigits)
                : datum.toString();
            label.textAlign = isParallelLabels
                ? labelRotation ? (sideFlag * alignFlag === -1 ? 'end' : 'start') : 'center'
                : sideFlag * regularFlipFlag === -1 ? 'end' : 'start';
        });
        var labelX = sideFlag * (this.tickSize + this.tickPadding);
        var autoRotation = isParallelLabels
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
