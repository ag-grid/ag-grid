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
import { Axis } from '../axis';
import { ChartAxisDirection } from './chartAxisDirection';
import { LinearScale } from '../scale/linearScale';
import { ContinuousScale } from '../scale/continuousScale';
import { POSITION, STRING_ARRAY, Validate } from '../util/validation';
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
            return ['top', 'bottom'].includes(this.position) ? ChartAxisDirection.X : ChartAxisDirection.Y;
        },
        enumerable: false,
        configurable: true
    });
    ChartAxis.prototype.useCalculatedTickCount = function () {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof LinearScale;
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
                continuous: this.scale instanceof ContinuousScale,
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
        Validate(STRING_ARRAY)
    ], ChartAxis.prototype, "keys", void 0);
    __decorate([
        Validate(POSITION)
    ], ChartAxis.prototype, "position", void 0);
    return ChartAxis;
}(Axis));
export { ChartAxis };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRBeGlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2NoYXJ0QXhpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsT0FBTyxFQUFFLElBQUksRUFBZ0IsTUFBTSxTQUFTLENBQUM7QUFDN0MsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQWV0RTtJQUErRyw2QkFHOUc7SUF5QkcsbUJBQXNCLFNBQXdCLEVBQUUsS0FBUTtRQUF4RCxZQUNJLGtCQUFNLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FDMUI7UUF6QkQsVUFBSSxHQUFhLEVBQUUsQ0FBQztRQUVwQixpQkFBVyxHQUFrQixFQUFFLENBQUM7UUFFaEMsNkJBQXVCLEdBQVksS0FBSyxDQUFDO1FBRXRCLGFBQU8sR0FBaUQsRUFBRSxDQUFDO1FBc0I5RSxjQUFRLEdBQTRCLE1BQU0sQ0FBQzs7SUFIM0MsQ0FBQztJQWpCRCxzQkFBSSwyQkFBSTthQUFSOztZQUNJLE9BQU8sTUFBQyxJQUFJLENBQUMsV0FBbUIsQ0FBQyxJQUFJLG1DQUFJLEVBQUUsQ0FBQztRQUNoRCxDQUFDOzs7T0FBQTtJQUVELHNCQUFJLGdDQUFTO2FBQWI7WUFDSSxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ25HLENBQUM7OztPQUFBO0lBRVMsMENBQXNCLEdBQWhDO1FBQ0ksbUZBQW1GO1FBQ25GLDJGQUEyRjtRQUMzRiwyQkFBMkI7UUFDM0IsT0FBTyxJQUFJLENBQUMsS0FBSyxZQUFZLFdBQVcsQ0FBQztJQUM3QyxDQUFDO0lBU00sMEJBQU0sR0FBYixVQUFjLGdCQUF5QjtRQUNuQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFdkIsT0FBTyxpQkFBTSxNQUFNLFlBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRVMsbUNBQWUsR0FBekI7UUFDSSxRQUFRLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbkIsS0FBSyxLQUFLO2dCQUNOLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUMzQixNQUFNO1lBQ1YsS0FBSyxPQUFPO2dCQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDNUIsTUFBTTtZQUNWLEtBQUssUUFBUTtnQkFDVCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDM0IsTUFBTTtZQUNWLEtBQUssTUFBTTtnQkFDUCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQzVCLE1BQU07U0FDYjtRQUVELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDL0M7SUFDTCxDQUFDO0lBRVMsbUNBQWUsR0FBekI7O1FBQ1UsSUFBQSxLQUFzRCxJQUFJLEVBQXhELFNBQVMsZUFBQSxFQUFFLFdBQVcsaUJBQUEsRUFBRSx1QkFBdUIsNkJBQVMsQ0FBQztRQUVqRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1NBQzlDO2FBQU07WUFDSCxJQUFNLE9BQU8sR0FBWSxFQUFFLENBQUM7WUFDNUIsSUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLHVCQUF1QixJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBeEMsQ0FBd0MsQ0FBQyxDQUFDOztnQkFDMUYsS0FBcUIsSUFBQSxrQkFBQSxTQUFBLGFBQWEsQ0FBQSw0Q0FBQSx1RUFBRTtvQkFBL0IsSUFBTSxNQUFNLDBCQUFBO29CQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUM3Qzs7Ozs7Ozs7O1lBRUQsSUFBTSxNQUFNLEdBQUcsQ0FBQSxLQUFBLElBQUksS0FBSyxFQUFPLENBQUEsQ0FBQyxNQUFNLG9DQUFJLE9BQU8sR0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3REO0lBQ0wsQ0FBQztJQUVELHVDQUFtQixHQUFuQixVQUFvQixDQUFNO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVELHFDQUFpQixHQUFqQjtRQUFBLGlCQUVDO1FBREcsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQTdDLENBQTZDLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQsa0NBQWMsR0FBZDtRQUNJLGtCQUNJLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUM3QixpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQ3pDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFDckIsSUFBSSxDQUFDLE1BQU0sRUFDaEI7SUFDTixDQUFDO0lBR0QsNkJBQVMsR0FBVCxVQUFVLE1BQWtCO1FBQTVCLGlCQW1DQztRQWxDRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNuRjtRQUVELElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7WUFDMUIsSUFBTSxJQUFJLEdBQUc7Z0JBQ1QsT0FBTyxLQUFJLENBQUMsV0FBVztxQkFDbEIsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLEVBQXpCLENBQXlCLENBQUM7cUJBQ3JDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxVQUFVO29CQUNyQixJQUFJLENBQUMsSUFBSSxPQUFULElBQUksMkJBQVMsVUFBVSxJQUFFO29CQUN6QixPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLFdBQVcsR0FBRztnQkFDZixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ2YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxZQUFZLGVBQWU7Z0JBQ2pELElBQUksTUFBQTtnQkFDSixtQkFBbUIsRUFBRSxVQUFDLFNBQWlCLG9CQUFLLE9BQUEsTUFBQSxNQUFBLE1BQUEsS0FBSSxDQUFDLEtBQUssRUFBQyxVQUFVLG1EQUFHLEVBQUUsU0FBUyxXQUFBLEVBQUUsQ0FBQyxtQ0FBSSxTQUFTLENBQUEsRUFBQTtnQkFDL0YsY0FBYyxFQUFFLHNCQUFNLE9BQUEsTUFBQSxLQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsbUNBQUksQ0FBQyxDQUFBLEVBQUE7Z0JBQy9DLFlBQVksRUFBRSxVQUFDLEdBQUcsSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUF2QixDQUF1QjtnQkFDOUMsV0FBVyxFQUFFLFVBQUMsR0FBRyxvQkFBSyxPQUFBLE1BQUEsTUFBQSxNQUFBLEtBQUksQ0FBQyxLQUFLLEVBQUMsTUFBTSxtREFBRyxHQUFHLENBQUMsbUNBQUksU0FBUyxDQUFBLEVBQUE7YUFDOUQsQ0FBQztTQUNMO1FBRUQsSUFBTSxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMsbUJBQW1CLHVCQUM5QyxJQUFJLENBQUMsU0FBUyxLQUNqQixNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsSUFDMUIsQ0FBQztRQUNILElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDO1FBRTlELElBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsY0FBYyxDQUFDO0lBQ3RELENBQUM7SUFFRCxnQ0FBWSxHQUFaLFVBQWEsTUFBa0I7O1FBQzNCLE1BQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsMENBQUUsUUFBUSwwQ0FBRSxPQUFPLEVBQUUsQ0FBQztRQUNyRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQVEsSUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsbUNBQWUsR0FBZixVQUFnQixNQUFrQjtRQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUNuRCxDQUFDO0lBRU0sMkJBQU8sR0FBZDs7UUFDSSxpQkFBTSxPQUFPLFdBQUUsQ0FBQzs7WUFFaEIsS0FBNEIsSUFBQSxLQUFBLFNBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQS9DLElBQUEsS0FBQSxtQkFBYSxFQUFaLEdBQUcsUUFBQSxFQUFFLE1BQU0sUUFBQTtnQkFDbkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QixPQUFRLElBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM3Qjs7Ozs7Ozs7O0lBQ0wsQ0FBQztJQUVTLDJDQUF1QixHQUFqQztRQUFBLGlCQWlCQzs7UUFoQkcsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsSUFBSTtZQUNsRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QyxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDeEMsR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztvQkFDZCxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQztpQkFDbkIsQ0FBQyxDQUFDO2FBQ047WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUMsRUFBRSxFQUFpRCxDQUFDLENBQUM7UUFDdEQsT0FBTztZQUNILFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixXQUFXLGFBQUE7WUFDWCxZQUFZLEVBQUUsTUFBQSxJQUFJLENBQUMsS0FBSywwQ0FBRSxJQUFJO1NBQ2pDLENBQUM7SUFDTixDQUFDO0lBaExEO1FBREMsUUFBUSxDQUFDLFlBQVksQ0FBQzsyQ0FDSDtJQTRCcEI7UUFEQyxRQUFRLENBQUMsUUFBUSxDQUFDOytDQUN3QjtJQXFKL0MsZ0JBQUM7Q0FBQSxBQXRMRCxDQUErRyxJQUFJLEdBc0xsSDtTQXRMWSxTQUFTIn0=