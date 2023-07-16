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
exports.CategoryAxis = void 0;
var validation_1 = require("../../util/validation");
var bandScale_1 = require("../../scale/bandScale");
var cartesianAxis_1 = require("./cartesianAxis");
var CategoryAxis = /** @class */ (function (_super) {
    __extends(CategoryAxis, _super);
    function CategoryAxis(moduleCtx) {
        var _this = _super.call(this, moduleCtx, new bandScale_1.BandScale()) || this;
        _this._paddingOverrideEnabled = false;
        _this.groupPaddingInner = 0.1;
        _this.includeInvisibleDomains = true;
        return _this;
    }
    Object.defineProperty(CategoryAxis.prototype, "paddingInner", {
        get: function () {
            this._paddingOverrideEnabled = true;
            return this.scale.paddingInner;
        },
        set: function (value) {
            this._paddingOverrideEnabled = true;
            this.scale.paddingInner = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryAxis.prototype, "paddingOuter", {
        get: function () {
            return this.scale.paddingOuter;
        },
        set: function (value) {
            this.scale.paddingOuter = value;
        },
        enumerable: false,
        configurable: true
    });
    CategoryAxis.prototype.normaliseDataDomain = function (d) {
        var e_1, _a;
        var _b;
        var _c;
        // Prevent duplicate categories.
        var valuesSet = {};
        try {
            for (var d_1 = __values(d), d_1_1 = d_1.next(); !d_1_1.done; d_1_1 = d_1.next()) {
                var next = d_1_1.value;
                (_b = valuesSet[_c = String(next)]) !== null && _b !== void 0 ? _b : (valuesSet[_c] = next);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (d_1_1 && !d_1_1.done && (_a = d_1.return)) _a.call(d_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Object.values(valuesSet);
    };
    CategoryAxis.prototype.calculateDomain = function () {
        if (!this._paddingOverrideEnabled) {
            var boundSeries = this.boundSeries;
            var paddings = boundSeries.map(function (s) { var _a; return (_a = s.getBandScalePadding) === null || _a === void 0 ? void 0 : _a.call(s); }).filter(function (p) { return p != null; });
            if (paddings.length > 0) {
                this.scale.paddingInner = Math.min.apply(Math, __spreadArray([], __read(paddings.map(function (p) { return p.inner; }))));
                this.scale.paddingOuter = Math.max.apply(Math, __spreadArray([], __read(paddings.map(function (p) { return p.outer; }))));
            }
        }
        return _super.prototype.calculateDomain.call(this);
    };
    CategoryAxis.className = 'CategoryAxis';
    CategoryAxis.type = 'category';
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], CategoryAxis.prototype, "groupPaddingInner", void 0);
    return CategoryAxis;
}(cartesianAxis_1.CartesianAxis));
exports.CategoryAxis = CategoryAxis;
//# sourceMappingURL=categoryAxis.js.map