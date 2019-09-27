// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angle_1 = require("./util/angle");
var CanvasAxis = /** @class */ (function () {
    function CanvasAxis(scale) {
        this.translation = [0, 0];
        this.rotation = 0; // radians
        this.lineWidth = 1;
        this.tickWidth = 1;
        this.tickSize = 6;
        this.tickPadding = 5;
        this.lineColor = 'black';
        this.tickColor = 'black';
        this.labelFont = '14px Verdana';
        this.labelColor = 'black';
        this.flippedLabels = false;
        this.mirroredLabels = false;
        this.scale = scale;
    }
    // To translate or rotate the axis the ctx can be transformed prior to render
    CanvasAxis.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(this.translation[0], this.translation[1]);
        ctx.rotate(this.rotation);
        var scale = this.scale;
        // Render ticks and labels.
        {
            var ticks = scale.ticks(10);
            var bandwidth = (scale.bandwidth || 0) / 2;
            var tickCount = ticks.length;
            var pxShift = Math.floor(this.tickWidth) % 2 / 2;
            var sideFlag = this.mirroredLabels ? 1 : -1;
            ctx.lineWidth = this.tickWidth;
            ctx.strokeStyle = this.tickColor;
            ctx.fillStyle = this.labelColor;
            ctx.textAlign = sideFlag === -1 ? 'end' : 'start';
            ctx.textBaseline = 'middle';
            ctx.font = this.labelFont;
            ctx.beginPath();
            for (var i = 0; i < tickCount; i++) {
                var tick = ticks[i];
                var r = scale.convert(tick) - this.tickWidth / 2 + bandwidth;
                ctx.moveTo(sideFlag * this.tickSize, r + pxShift);
                ctx.lineTo(0, r + pxShift);
                if (this.flippedLabels) {
                    var rotation = angle_1.normalizeAngle360(this.rotation);
                    var flipFlag = (rotation >= 0 && rotation <= Math.PI) ? -1 : 1;
                    ctx.save();
                    ctx.translate(sideFlag * (this.tickSize + this.tickPadding), r);
                    ctx.rotate(flipFlag * Math.PI / 2);
                    var labelWidth = ctx.measureText(tick.toString()).width;
                    ctx.fillText(tick.toString(), -sideFlag * labelWidth / 2, -sideFlag * flipFlag * this.tickPadding);
                    ctx.restore();
                }
                else {
                    ctx.fillText(tick.toString(), sideFlag * (this.tickSize + this.tickPadding), r);
                }
            }
            ctx.stroke();
        }
        // Render axis line.
        {
            var pxShift = Math.floor(this.lineWidth) % 2 / 2;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.lineColor;
            ctx.beginPath();
            ctx.moveTo(pxShift, scale.range[0]);
            ctx.lineTo(pxShift, scale.range[scale.range.length - 1]);
            ctx.stroke();
        }
        ctx.restore();
    };
    return CanvasAxis;
}());
exports.CanvasAxis = CanvasAxis;
