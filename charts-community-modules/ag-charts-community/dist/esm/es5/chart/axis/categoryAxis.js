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
import { NUMBER, Validate } from '../../util/validation';
import { BandScale } from '../../scale/bandScale';
import { ChartAxis } from '../chartAxis';
var CategoryAxis = /** @class */ (function (_super) {
    __extends(CategoryAxis, _super);
    function CategoryAxis(moduleCtx) {
        var _this = _super.call(this, moduleCtx, new BandScale()) || this;
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
        // Prevent duplicate categories.
        var valuesSet = new Set(d);
        return new (Array.bind.apply(Array, __spreadArray([void 0], __read(valuesSet.values()))))();
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
        Validate(NUMBER(0, 1))
    ], CategoryAxis.prototype, "groupPaddingInner", void 0);
    return CategoryAxis;
}(ChartAxis));
export { CategoryAxis };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnlBeGlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2F4aXMvY2F0ZWdvcnlBeGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDekQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFHekM7SUFBa0MsZ0NBQXFDO0lBTW5FLHNCQUFZLFNBQXdCO1FBQXBDLFlBQ0ksa0JBQU0sU0FBUyxFQUFFLElBQUksU0FBUyxFQUFVLENBQUMsU0FHNUM7UUFOTyw2QkFBdUIsR0FBRyxLQUFLLENBQUM7UUFTeEMsdUJBQWlCLEdBQVcsR0FBRyxDQUFDO1FBSjVCLEtBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7O0lBQ3hDLENBQUM7SUFLRCxzQkFBSSxzQ0FBWTthQUloQjtZQUNJLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7WUFDcEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUNuQyxDQUFDO2FBUEQsVUFBaUIsS0FBYTtZQUMxQixJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUNwQyxDQUFDOzs7T0FBQTtJQU1ELHNCQUFJLHNDQUFZO2FBR2hCO1lBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUNuQyxDQUFDO2FBTEQsVUFBaUIsS0FBYTtZQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDcEMsQ0FBQzs7O09BQUE7SUFLRCwwQ0FBbUIsR0FBbkIsVUFBb0IsQ0FBc0I7UUFDdEMsZ0NBQWdDO1FBQ2hDLElBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFjLENBQUMsQ0FBQyxDQUFDO1FBQzFDLFlBQVcsS0FBSyxZQUFMLEtBQUssaUNBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFFO0lBQzVDLENBQUM7SUFFUyxzQ0FBZSxHQUF6QjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDdkIsSUFBQSxXQUFXLEdBQUssSUFBSSxZQUFULENBQVU7WUFDN0IsSUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsWUFBSyxPQUFBLE1BQUEsQ0FBQyxDQUFDLG1CQUFtQiwrQ0FBckIsQ0FBQyxDQUF3QixDQUFBLEVBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsSUFBSSxJQUFJLEVBQVQsQ0FBUyxDQUFDLENBQUM7WUFDNUYsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsT0FBUixJQUFJLDJCQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFFLENBQUMsS0FBSyxFQUFSLENBQVEsQ0FBQyxHQUFDLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLE9BQVIsSUFBSSwyQkFBUSxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBRSxDQUFDLEtBQUssRUFBUixDQUFRLENBQUMsR0FBQyxDQUFDO2FBQ3hFO1NBQ0o7UUFFRCxPQUFPLGlCQUFNLGVBQWUsV0FBRSxDQUFDO0lBQ25DLENBQUM7SUEvQ00sc0JBQVMsR0FBRyxjQUFjLENBQUM7SUFDM0IsaUJBQUksR0FBRyxVQUFtQixDQUFDO0lBV2xDO1FBREMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7MkRBQ1M7SUFvQ3BDLG1CQUFDO0NBQUEsQUFqREQsQ0FBa0MsU0FBUyxHQWlEMUM7U0FqRFksWUFBWSJ9