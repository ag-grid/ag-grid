"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axis_1 = require("../axis");
const linearScale_1 = require("../scale/linearScale");
var ChartAxisDirection;
(function (ChartAxisDirection) {
    ChartAxisDirection["X"] = "x";
    ChartAxisDirection["Y"] = "y"; // means 'radius' in polar charts
})(ChartAxisDirection = exports.ChartAxisDirection || (exports.ChartAxisDirection = {}));
function flipChartAxisDirection(direction) {
    if (direction === ChartAxisDirection.X) {
        return ChartAxisDirection.Y;
    }
    else {
        return ChartAxisDirection.X;
    }
}
exports.flipChartAxisDirection = flipChartAxisDirection;
var ChartAxisPosition;
(function (ChartAxisPosition) {
    ChartAxisPosition["Top"] = "top";
    ChartAxisPosition["Right"] = "right";
    ChartAxisPosition["Bottom"] = "bottom";
    ChartAxisPosition["Left"] = "left";
    ChartAxisPosition["Angle"] = "angle";
    ChartAxisPosition["Radius"] = "radius";
})(ChartAxisPosition = exports.ChartAxisPosition || (exports.ChartAxisPosition = {}));
class ChartAxis extends axis_1.Axis {
    constructor() {
        super(...arguments);
        this.keys = [];
        this.direction = ChartAxisDirection.Y;
        this.boundSeries = [];
        this._position = ChartAxisPosition.Left;
    }
    get type() {
        return this.constructor.type || '';
    }
    getMeta() {
        return {
            id: this.id,
            direction: this.direction,
            boundSeries: this.boundSeries,
        };
    }
    useCalculatedTickCount() {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof linearScale_1.LinearScale;
    }
    /**
     * For continuous axes, if tick count has not been specified, set the number of ticks based on the available range
     */
    calculateTickCount(availableRange) {
        if (!this.useCalculatedTickCount()) {
            return;
        }
        const tickInterval = 70; // Approximate number of pixels to allocate for each tick
        this._calculatedTickCount = this.tick.count || Math.max(2, Math.floor(availableRange / tickInterval));
    }
    set position(value) {
        if (this._position !== value) {
            this._position = value;
            switch (value) {
                case ChartAxisPosition.Top:
                    this.direction = ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = true;
                    this.label.parallel = true;
                    break;
                case ChartAxisPosition.Right:
                    this.direction = ChartAxisDirection.Y;
                    this.rotation = 0;
                    this.label.mirrored = true;
                    this.label.parallel = false;
                    break;
                case ChartAxisPosition.Bottom:
                    this.direction = ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = false;
                    this.label.parallel = true;
                    break;
                case ChartAxisPosition.Left:
                    this.direction = ChartAxisDirection.Y;
                    this.rotation = 0;
                    this.label.mirrored = false;
                    this.label.parallel = false;
                    break;
            }
        }
    }
    get position() {
        return this._position;
    }
}
exports.ChartAxis = ChartAxis;
//# sourceMappingURL=chartAxis.js.map