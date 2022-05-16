import { Axis } from "../axis";
import { LinearScale } from "../scale/linearScale";
export var ChartAxisDirection;
(function (ChartAxisDirection) {
    ChartAxisDirection["X"] = "x";
    ChartAxisDirection["Y"] = "y"; // means 'radius' in polar charts
})(ChartAxisDirection || (ChartAxisDirection = {}));
export function flipChartAxisDirection(direction) {
    if (direction === ChartAxisDirection.X) {
        return ChartAxisDirection.Y;
    }
    else {
        return ChartAxisDirection.X;
    }
}
export var ChartAxisPosition;
(function (ChartAxisPosition) {
    ChartAxisPosition["Top"] = "top";
    ChartAxisPosition["Right"] = "right";
    ChartAxisPosition["Bottom"] = "bottom";
    ChartAxisPosition["Left"] = "left";
    ChartAxisPosition["Angle"] = "angle";
    ChartAxisPosition["Radius"] = "radius";
})(ChartAxisPosition || (ChartAxisPosition = {}));
export class ChartAxis extends Axis {
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
        return this.scale instanceof LinearScale;
    }
    /**
     * For continuous axes, if tick count has not been specified, set the number of ticks based on the available range
     */
    calculateTickCount(availableRange) {
        if (!this.useCalculatedTickCount()) {
            return;
        }
        // Approximate number of pixels to allocate for each tick.
        const optimalRangePx = 600;
        const optimalTickInteralPx = 70;
        const tickIntervalRatio = Math.pow(Math.log(availableRange) / Math.log(optimalRangePx), 2);
        const tickInterval = optimalTickInteralPx * tickIntervalRatio;
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
//# sourceMappingURL=chartAxis.js.map