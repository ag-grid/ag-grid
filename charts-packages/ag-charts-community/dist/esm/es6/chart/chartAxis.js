var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Axis } from '../axis';
import { LinearScale } from '../scale/linearScale';
import { POSITION, STRING_ARRAY, Validate } from '../util/validation';
export var ChartAxisDirection;
(function (ChartAxisDirection) {
    ChartAxisDirection["X"] = "x";
    ChartAxisDirection["Y"] = "y";
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
        this.includeInvisibleDomains = false;
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
    calculateTickCount() {
        if (!this.useCalculatedTickCount()) {
            return;
        }
        const { tick: { count }, range: [min, max], } = this;
        if (count !== undefined) {
            this._calculatedTickCount = undefined;
            return;
        }
        const availableRange = Math.abs(max - min);
        const optimalTickInteralPx = this.calculateTickIntervalEstimate();
        // Approximate number of pixels to allocate for each tick.
        const optimalRangePx = 600;
        const minTickIntervalRatio = 0.75;
        const tickIntervalRatio = Math.max(Math.pow(Math.log(availableRange) / Math.log(optimalRangePx), 2), minTickIntervalRatio);
        const tickInterval = optimalTickInteralPx * tickIntervalRatio;
        this._calculatedTickCount = Math.max(2, Math.floor(availableRange / tickInterval));
    }
    calculateTickIntervalEstimate() {
        var _a, _b;
        const { domain, label: { fontSize }, direction, } = this;
        const padding = fontSize * 1.5;
        if (direction === ChartAxisDirection.Y) {
            return fontSize * 2 + padding;
        }
        const ticks = ((_b = (_a = this.scale).ticks) === null || _b === void 0 ? void 0 : _b.call(_a, 10)) || [domain[0], domain[domain.length - 1]];
        // Dynamic optimal tick interval based upon label scale.
        const approxMaxLabelCharacters = Math.max(...ticks.map((v) => {
            return String(v).length;
        }));
        return approxMaxLabelCharacters * fontSize + padding;
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
    calculateDomain({ primaryTickCount }) {
        const { direction, boundSeries, includeInvisibleDomains } = this;
        if (this.linkedTo) {
            this.domain = this.linkedTo.domain;
        }
        else {
            const domains = [];
            boundSeries
                .filter((s) => includeInvisibleDomains || s.visible)
                .forEach((series) => {
                domains.push(series.getDomain(direction));
            });
            const domain = new Array().concat(...domains);
            const isYAxis = this.direction === 'y';
            primaryTickCount = this.updateDomain(domain, isYAxis, primaryTickCount);
        }
        return { primaryTickCount };
    }
    updateDomain(domain, _isYAxis, primaryTickCount) {
        this.domain = domain;
        return primaryTickCount;
    }
}
__decorate([
    Validate(STRING_ARRAY)
], ChartAxis.prototype, "keys", void 0);
__decorate([
    Validate(POSITION)
], ChartAxis.prototype, "_position", void 0);
