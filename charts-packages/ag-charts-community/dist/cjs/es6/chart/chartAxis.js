"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartAxis = exports.flipChartAxisDirection = void 0;
const axis_1 = require("../axis");
const chartAxisDirection_1 = require("./chartAxisDirection");
const linearScale_1 = require("../scale/linearScale");
const validation_1 = require("../util/validation");
function flipChartAxisDirection(direction) {
    if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
        return chartAxisDirection_1.ChartAxisDirection.Y;
    }
    else {
        return chartAxisDirection_1.ChartAxisDirection.X;
    }
}
exports.flipChartAxisDirection = flipChartAxisDirection;
class ChartAxis extends axis_1.Axis {
    constructor() {
        super(...arguments);
        this.keys = [];
        this.direction = chartAxisDirection_1.ChartAxisDirection.Y;
        this.boundSeries = [];
        this.includeInvisibleDomains = false;
        this._position = 'left';
    }
    get type() {
        return this.constructor.type || '';
    }
    useCalculatedTickCount() {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof linearScale_1.LinearScale;
    }
    set position(value) {
        if (this._position !== value) {
            this._position = value;
            switch (value) {
                case 'top':
                    this.direction = chartAxisDirection_1.ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = true;
                    this.label.parallel = true;
                    break;
                case 'right':
                    this.direction = chartAxisDirection_1.ChartAxisDirection.Y;
                    this.rotation = 0;
                    this.label.mirrored = true;
                    this.label.parallel = false;
                    break;
                case 'bottom':
                    this.direction = chartAxisDirection_1.ChartAxisDirection.X;
                    this.rotation = -90;
                    this.label.mirrored = false;
                    this.label.parallel = true;
                    break;
                case 'left':
                    this.direction = chartAxisDirection_1.ChartAxisDirection.Y;
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
    calculateDomain() {
        const { direction, boundSeries, includeInvisibleDomains } = this;
        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        }
        else {
            const domains = [];
            boundSeries
                .filter((s) => includeInvisibleDomains || s.isEnabled())
                .forEach((series) => {
                domains.push(series.getDomain(direction));
            });
            const domain = new Array().concat(...domains);
            this.dataDomain = this.normaliseDataDomain(domain);
        }
    }
    normaliseDataDomain(d) {
        return d;
    }
    isAnySeriesActive() {
        return this.boundSeries.some((s) => this.includeInvisibleDomains || s.isEnabled());
    }
}
__decorate([
    validation_1.Validate(validation_1.STRING_ARRAY)
], ChartAxis.prototype, "keys", void 0);
__decorate([
    validation_1.Validate(validation_1.POSITION)
], ChartAxis.prototype, "_position", void 0);
exports.ChartAxis = ChartAxis;
