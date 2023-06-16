"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartAxis = void 0;
var axis_1 = require("../axis");
var chartAxisDirection_1 = require("./chartAxisDirection");
var linearScale_1 = require("../scale/linearScale");
var continuousScale_1 = require("../scale/continuousScale");
var validation_1 = require("../util/validation");
var ChartAxis = /** @class */ (function (_super) {
    __extends(ChartAxis, _super);
    function ChartAxis(moduleCtx, scale) {
        var _this = _super.call(this, moduleCtx, scale) || this;
        _this.keys = [];
        _this.boundSeries = [];
        _this.includeInvisibleDomains = false;
        _this.modules = {};
        _this.position = 'left';
        return _this;
    }
    Object.defineProperty(ChartAxis.prototype, "type", {
        get: function () {
            var _a;
            return (_a = this.constructor.type) !== null && _a !== void 0 ? _a : '';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChartAxis.prototype, "direction", {
        get: function () {
            return ['top', 'bottom'].includes(this.position) ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
        },
        enumerable: false,
        configurable: true
    });
    ChartAxis.prototype.useCalculatedTickCount = function () {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof linearScale_1.LinearScale;
    };
    ChartAxis.prototype.update = function (primaryTickCount) {
        this.updateDirection();
        return _super.prototype.update.call(this, primaryTickCount);
    };
    ChartAxis.prototype.updateDirection = function () {
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
    };
    ChartAxis.prototype.calculateDomain = function () {
        var e_1, _a, _b;
        var _c = this, direction = _c.direction, boundSeries = _c.boundSeries, includeInvisibleDomains = _c.includeInvisibleDomains;
        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        }
        else {
            var domains = [];
            var visibleSeries = boundSeries.filter(function (s) { return includeInvisibleDomains || s.isEnabled(); });
            try {
                for (var visibleSeries_1 = __values(visibleSeries), visibleSeries_1_1 = visibleSeries_1.next(); !visibleSeries_1_1.done; visibleSeries_1_1 = visibleSeries_1.next()) {
                    var series = visibleSeries_1_1.value;
                    domains.push(series.getDomain(direction));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (visibleSeries_1_1 && !visibleSeries_1_1.done && (_a = visibleSeries_1.return)) _a.call(visibleSeries_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var domain = (_b = new Array()).concat.apply(_b, __spreadArray([], __read(domains)));
            this.dataDomain = this.normaliseDataDomain(domain);
        }
    };
    ChartAxis.prototype.normaliseDataDomain = function (d) {
        return d;
    };
    ChartAxis.prototype.isAnySeriesActive = function () {
        var _this = this;
        return this.boundSeries.some(function (s) { return _this.includeInvisibleDomains || s.isEnabled(); });
    };
    ChartAxis.prototype.getLayoutState = function () {
        return __assign({ rect: this.computeBBox(), gridPadding: this.gridPadding, seriesAreaPadding: this.seriesAreaPadding, tickSize: this.tick.size }, this.layout);
    };
    ChartAxis.prototype.addModule = function (module) {
        var _this = this;
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        if (this.axisContext == null) {
            var keys = function () {
                return _this.boundSeries
                    .map(function (s) { return s.getKeys(_this.direction); })
                    .reduce(function (keys, seriesKeys) {
                    keys.push.apply(keys, __spreadArray([], __read(seriesKeys)));
                    return keys;
                }, []);
            };
            this.axisContext = {
                axisId: this.id,
                position: this.position,
                direction: this.direction,
                continuous: this.scale instanceof continuousScale_1.ContinuousScale,
                keys: keys,
                scaleValueFormatter: function (specifier) { var _a, _b, _c; return (_c = (_b = (_a = _this.scale).tickFormat) === null || _b === void 0 ? void 0 : _b.call(_a, { specifier: specifier })) !== null && _c !== void 0 ? _c : undefined; },
                scaleBandwidth: function () { var _a; return (_a = _this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0; },
                scaleConvert: function (val) { return _this.scale.convert(val); },
                scaleInvert: function (val) { var _a, _b, _c; return (_c = (_b = (_a = _this.scale).invert) === null || _b === void 0 ? void 0 : _b.call(_a, val)) !== null && _c !== void 0 ? _c : undefined; },
            };
        }
        var moduleInstance = new module.instanceConstructor(__assign(__assign({}, this.moduleCtx), { parent: this.axisContext }));
        this.modules[module.optionsKey] = { instance: moduleInstance };
        this[module.optionsKey] = moduleInstance;
    };
    ChartAxis.prototype.removeModule = function (module) {
        var _a, _b;
        (_b = (_a = this.modules[module.optionsKey]) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b.destroy();
        delete this.modules[module.optionsKey];
        delete this[module.optionsKey];
    };
    ChartAxis.prototype.isModuleEnabled = function (module) {
        return this.modules[module.optionsKey] != null;
    };
    ChartAxis.prototype.destroy = function () {
        var e_2, _a;
        _super.prototype.destroy.call(this);
        try {
            for (var _b = __values(Object.entries(this.modules)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], module = _d[1];
                module.instance.destroy();
                delete this.modules[key];
                delete this[key];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    ChartAxis.prototype.getTitleFormatterParams = function () {
        var _this = this;
        var _a;
        var boundSeries = this.boundSeries.reduce(function (acc, next) {
            var keys = next.getKeys(_this.direction);
            var names = next.getNames(_this.direction);
            for (var idx = 0; idx < keys.length; idx++) {
                acc.push({
                    key: keys[idx],
                    name: names[idx],
                });
            }
            return acc;
        }, []);
        return {
            direction: this.direction,
            boundSeries: boundSeries,
            defaultValue: (_a = this.title) === null || _a === void 0 ? void 0 : _a.text,
        };
    };
    __decorate([
        validation_1.Validate(validation_1.STRING_ARRAY)
    ], ChartAxis.prototype, "keys", void 0);
    __decorate([
        validation_1.Validate(validation_1.POSITION)
    ], ChartAxis.prototype, "position", void 0);
    return ChartAxis;
}(axis_1.Axis));
exports.ChartAxis = ChartAxis;
//# sourceMappingURL=chartAxis.js.map