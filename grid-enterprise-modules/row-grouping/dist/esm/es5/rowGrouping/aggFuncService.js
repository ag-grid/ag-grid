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
import { Bean, BeanStub, PostConstruct, _ } from '@ag-grid-community/core';
// @ts-ignore
var AGBigInt = typeof BigInt === 'undefined' ? null : BigInt;
var AggFuncService = /** @class */ (function (_super) {
    __extends(AggFuncService, _super);
    function AggFuncService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.aggFuncsMap = {};
        _this.initialised = false;
        return _this;
    }
    AggFuncService_1 = AggFuncService;
    AggFuncService.prototype.init = function () {
        if (this.initialised) {
            return;
        }
        this.initialiseWithDefaultAggregations();
        this.addAggFuncs(this.gridOptionsService.get('aggFuncs'));
    };
    AggFuncService.prototype.initialiseWithDefaultAggregations = function () {
        this.aggFuncsMap[AggFuncService_1.AGG_SUM] = aggSum;
        this.aggFuncsMap[AggFuncService_1.AGG_FIRST] = aggFirst;
        this.aggFuncsMap[AggFuncService_1.AGG_LAST] = aggLast;
        this.aggFuncsMap[AggFuncService_1.AGG_MIN] = aggMin;
        this.aggFuncsMap[AggFuncService_1.AGG_MAX] = aggMax;
        this.aggFuncsMap[AggFuncService_1.AGG_COUNT] = aggCount;
        this.aggFuncsMap[AggFuncService_1.AGG_AVG] = aggAvg;
        this.initialised = true;
    };
    AggFuncService.prototype.isAggFuncPossible = function (column, func) {
        var allKeys = this.getFuncNames(column);
        var allowed = _.includes(allKeys, func);
        var funcExists = _.exists(this.aggFuncsMap[func]);
        return allowed && funcExists;
    };
    AggFuncService.prototype.getDefaultAggFunc = function (column) {
        var defaultAgg = column.getColDef().defaultAggFunc;
        if (_.exists(defaultAgg) && this.isAggFuncPossible(column, defaultAgg)) {
            return defaultAgg;
        }
        if (this.isAggFuncPossible(column, AggFuncService_1.AGG_SUM)) {
            return AggFuncService_1.AGG_SUM;
        }
        var allKeys = this.getFuncNames(column);
        return _.existsAndNotEmpty(allKeys) ? allKeys[0] : null;
    };
    AggFuncService.prototype.addAggFuncs = function (aggFuncs) {
        _.iterateObject(aggFuncs, this.addAggFunc.bind(this));
    };
    AggFuncService.prototype.addAggFunc = function (key, aggFunc) {
        this.init();
        this.aggFuncsMap[key] = aggFunc;
    };
    AggFuncService.prototype.getAggFunc = function (name) {
        this.init();
        return this.aggFuncsMap[name];
    };
    AggFuncService.prototype.getFuncNames = function (column) {
        var userAllowedFuncs = column.getColDef().allowedAggFuncs;
        return userAllowedFuncs == null ? Object.keys(this.aggFuncsMap).sort() : userAllowedFuncs;
    };
    AggFuncService.prototype.clear = function () {
        this.aggFuncsMap = {};
    };
    var AggFuncService_1;
    AggFuncService.AGG_SUM = 'sum';
    AggFuncService.AGG_FIRST = 'first';
    AggFuncService.AGG_LAST = 'last';
    AggFuncService.AGG_MIN = 'min';
    AggFuncService.AGG_MAX = 'max';
    AggFuncService.AGG_COUNT = 'count';
    AggFuncService.AGG_AVG = 'avg';
    __decorate([
        PostConstruct
    ], AggFuncService.prototype, "init", null);
    AggFuncService = AggFuncService_1 = __decorate([
        Bean('aggFuncService')
    ], AggFuncService);
    return AggFuncService;
}(BeanStub));
export { AggFuncService };
function aggSum(params) {
    var values = params.values;
    var result = null; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (typeof value === 'number') {
            if (result === null) {
                result = value;
            }
            else {
                if (AGBigInt) {
                    result += typeof result === 'number' ? value : AGBigInt(value);
                }
                else {
                    result += value;
                }
            }
        }
        else if (typeof value === 'bigint') {
            if (result === null) {
                result = value;
            }
            else {
                result = (typeof result === 'bigint' ? result : AGBigInt(result)) + value;
            }
        }
    }
    return result;
}
function aggFirst(params) {
    return params.values.length > 0 ? params.values[0] : null;
}
function aggLast(params) {
    return params.values.length > 0 ? _.last(params.values) : null;
}
function aggMin(params) {
    var values = params.values;
    var result = null;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if ((typeof value === 'number' || typeof value === 'bigint') && (result === null || result > value)) {
            result = value;
        }
    }
    return result;
}
function aggMax(params) {
    var values = params.values;
    var result = null;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if ((typeof value === 'number' || typeof value === 'bigint') && (result === null || result < value)) {
            result = value;
        }
    }
    return result;
}
function aggCount(params) {
    var values = params.values;
    var result = 0;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        // check if the value is from a group, in which case use the group's count
        result += value != null && typeof value.value === 'number' ? value.value : 1;
    }
    return result;
}
// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(params) {
    var _a, _b, _c;
    var values = params.values;
    var sum = 0; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please
    var count = 0;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (var i = 0; i < values.length; i++) {
        var currentValue = values[i];
        var valueToAdd = null;
        if (typeof currentValue === 'number' || typeof currentValue === 'bigint') {
            valueToAdd = currentValue;
            count++;
        }
        else if (currentValue != null && (typeof currentValue.value === 'number' || typeof currentValue.value === 'bigint') && typeof currentValue.count === 'number') {
            // we are aggregating groups, so we take the aggregated values to calculated a weighted average
            if (AGBigInt) {
                valueToAdd = currentValue.value * (typeof currentValue.value === 'number' ? currentValue.count : AGBigInt(currentValue.count));
            }
            else {
                valueToAdd = currentValue.value * currentValue.count;
            }
            count += currentValue.count;
        }
        if (typeof valueToAdd === 'number') {
            if (AGBigInt) {
                sum += typeof sum === 'number' ? valueToAdd : AGBigInt(valueToAdd);
            }
            else {
                sum += valueToAdd;
            }
        }
        else if (typeof valueToAdd === 'bigint') {
            sum = (typeof sum === 'bigint' ? sum : AGBigInt(sum)) + valueToAdd;
        }
    }
    var value = null;
    // avoid divide by zero error
    if (count > 0) {
        if (AGBigInt) {
            value = sum / (typeof sum === 'number' ? count : AGBigInt(count));
        }
        else {
            value = sum / count;
        }
    }
    // the previous aggregation data
    var existingAggData = (_b = (_a = params.rowNode) === null || _a === void 0 ? void 0 : _a.aggData) === null || _b === void 0 ? void 0 : _b[(_c = params.column) === null || _c === void 0 ? void 0 : _c.getColId()];
    if (existingAggData && existingAggData.count === count && existingAggData.value === value) {
        // the underlying values haven't changed, return the old object to avoid triggering change detection
        return existingAggData;
    }
    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    return {
        count: count,
        value: value,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function () {
            return typeof this.value === 'number' || typeof this.value === 'bigint' ? this.value.toString() : '';
        },
        // used for sorting
        toNumber: function () {
            return this.value;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdnRnVuY1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcm93R3JvdXBpbmcvYWdnRnVuY1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILElBQUksRUFDSixRQUFRLEVBSVIsYUFBYSxFQUNiLENBQUMsRUFFSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLGFBQWE7QUFDYixJQUFNLFFBQVEsR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBRy9EO0lBQW9DLGtDQUFRO0lBQTVDO1FBQUEscUVBK0VDO1FBckVXLGlCQUFXLEdBQWlDLEVBQUUsQ0FBQztRQUMvQyxpQkFBVyxHQUFHLEtBQUssQ0FBQzs7SUFvRWhDLENBQUM7dUJBL0VZLGNBQWM7SUFjZiw2QkFBSSxHQUFaO1FBQ0ksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTywwREFBaUMsR0FBekM7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2xELElB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