var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { BandScale } from '../../scale/bandScale';
import { ChartAxis } from '../chartAxis';
var CategoryAxis = /** @class */ (function (_super) {
    __extends(CategoryAxis, _super);
    function CategoryAxis() {
        var _this = _super.call(this, new BandScale()) || this;
        _this._paddingOverrideEnabled = false;
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
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CategoryAxis.prototype, "paddingOuter", {
        get: function () {
            return this.scale.paddingOuter;
        },
        set: function (value) {
            this.scale.paddingOuter = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CategoryAxis.prototype, "domain", {
        get: function () {
            return this.scale.domain.slice();
        },
        set: function (values) {
            // Prevent duplicate categories.
            var valuesSet = new Set(values);
            this.scale.domain = new (Array.bind.apply(Array, __spread([void 0], valuesSet.values())))();
        },
        enumerable: true,
        configurable: true
    });
    CategoryAxis.prototype.calculateDomain = function (_a) {
        var primaryTickCount = _a.primaryTickCount;
        if (!this._paddingOverrideEnabled) {
            var boundSeries = this.boundSeries;
            if (boundSeries.some(function (s) { return ['bar', 'column'].includes(s.type); })) {
                this.scale.paddingInner = 0.2;
                this.scale.paddingOuter = 0.3;
            }
            else {
                this.scale.paddingInner = 1;
                this.scale.paddingOuter = 0;
            }
        }
        return _super.prototype.calculateDomain.call(this, { primaryTickCount: primaryTickCount });
    };
    CategoryAxis.className = 'CategoryAxis';
    CategoryAxis.type = 'category';
    return CategoryAxis;
}(ChartAxis));
export { CategoryAxis };
