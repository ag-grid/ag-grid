"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartAxis = void 0;
const axis_1 = require("../axis");
const chartAxisDirection_1 = require("./chartAxisDirection");
const linearScale_1 = require("../scale/linearScale");
const continuousScale_1 = require("../scale/continuousScale");
const validation_1 = require("../util/validation");
class ChartAxis extends axis_1.Axis {
    constructor(moduleCtx, scale) {
        super(moduleCtx, scale);
        this.keys = [];
        this.boundSeries = [];
        this.includeInvisibleDomains = false;
        this.modules = {};
        this.position = 'left';
    }
    get type() {
        var _a;
        return (_a = this.constructor.type) !== null && _a !== void 0 ? _a : '';
    }
    get direction() {
        return ['top', 'bottom'].includes(this.position) ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
    }
    useCalculatedTickCount() {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof linearScale_1.LinearScale;
    }
    update(primaryTickCount) {
        this.updateDirection();
        return super.update(primaryTickCount);
    }
    updateDirection() {
        switch (this.position) {
            case 'top':
                this.rotation = -90;
                this.label.mirrored = true;
                this.label.parallel = true;
                break;
            case 'right':
                this.rotation = 0;
                this.label.mirrored = true;
                this.label.parallel = false;
                break;
            case 'bottom':
                this.rotation = -90;
                this.label.mirrored = false;
                this.label.parallel = true;
                break;
            case 'left':
                this.rotation = 0;
                this.label.mirrored = false;
                this.label.parallel = false;
                break;
        }
        if (this.axisContext) {
            this.axisContext.position = this.position;
            this.axisContext.direction = this.direction;
        }
    }
    calculateDomain() {
        const { direction, boundSeries, includeInvisibleDomains } = this;
        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        }
        else {
            const domains = [];
            const visibleSeries = boundSeries.filter((s) => includeInvisibleDomains || s.isEnabled());
            for (const series of visibleSeries) {
                domains.push(series.getDomain(direction));
            }
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
    getLayoutState() {
        return Object.assign({ rect: this.computeBBox(), gridPadding: this.gridPadding, seriesAreaPadding: this.seriesAreaPadding, tickSize: this.tick.size }, this.layout);
    }
    addModule(module) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        if (this.axisContext == null) {
            const keys = () => {
                return this.boundSeries
                    .map((s) => s.getKeys(this.direction))
                    .reduce((keys, seriesKeys) => {
                    keys.push(...seriesKeys);
                    return keys;
                }, []);
            };
            this.axisContext = {
                axisId: this.id,
                position: this.position,
                direction: this.direction,
                continuous: this.scale instanceof continuousScale_1.ContinuousScale,
                keys,
                scaleValueFormatter: (specifier) => { var _a, _b, _c; return (_c = (_b = (_a = this.scale).tickFormat) === null || _b === void 0 ? void 0 : _b.call(_a, { specifier })) !== null && _c !== void 0 ? _c : undefined; },
                scaleBandwidth: () => { var _a; return (_a = this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0; },
                scaleConvert: (val) => this.scale.convert(val),
                scaleInvert: (val) => { var _a, _b, _c; return (_c = (_b = (_a = this.scale).invert) === null || _b === void 0 ? void 0 : _b.call(_a, val)) !== null && _c !== void 0 ? _c : undefined; },
            };
        }
        const moduleInstance = new module.instanceConstructor(Object.assign(Object.assign({}, this.moduleCtx), { parent: this.axisContext }));
        this.modules[module.optionsKey] = { instance: moduleInstance };
        this[module.optionsKey] = moduleInstance;
    }
    removeModule(module) {
        var _a, _b;
        (_b = (_a = this.modules[module.optionsKey]) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b.destroy();
        delete this.modules[module.optionsKey];
        delete this[module.optionsKey];
    }
    isModuleEnabled(module) {
        return this.modules[module.optionsKey] != null;
    }
    destroy() {
        super.destroy();
        for (const [key, module] of Object.entries(this.modules)) {
            module.instance.destroy();
            delete this.modules[key];
            delete this[key];
        }
    }
    getTitleFormatterParams() {
        var _a;
        const boundSeries = this.boundSeries.reduce((acc, next) => {
            const keys = next.getKeys(this.direction);
            const names = next.getNames(this.direction);
            for (let idx = 0; idx < keys.length; idx++) {
                acc.push({
                    key: keys[idx],
                    name: names[idx],
                });
            }
            return acc;
        }, []);
        return {
            direction: this.direction,
            boundSeries,
            defaultValue: (_a = this.title) === null || _a === void 0 ? void 0 : _a.text,
        };
    }
}
__decorate([
    validation_1.Validate(validation_1.STRING_ARRAY)
], ChartAxis.prototype, "keys", void 0);
__decorate([
    validation_1.Validate(validation_1.POSITION)
], ChartAxis.prototype, "position", void 0);
exports.ChartAxis = ChartAxis;
