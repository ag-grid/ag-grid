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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, PostConstruct, _ } from "@ag-grid-community/core";
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
        this.addAggFuncs(this.gridOptionsWrapper.getAggFuncs());
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
    AggFuncService.prototype.getDefaultAggFunc = function (column) {
        var allKeys = this.getFuncNames(column);
        // use 'sum' if it's a) allowed for the column and b) still registered
        // (ie not removed by user)
        var sumInKeysList = _.includes(allKeys, AggFuncService_1.AGG_SUM);
        var sumInFuncs = _.exists(this.aggFuncsMap[AggFuncService_1.AGG_SUM]);
        if (sumInKeysList && sumInFuncs) {
            return AggFuncService_1.AGG_SUM;
        }
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
        if (_.exists(userAllowedFuncs) && userAllowedFuncs) {
            return userAllowedFuncs;
        }
        return Object.keys(this.aggFuncsMap).sort();
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
        Autowired('gridOptionsWrapper')
    ], AggFuncService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], AggFuncService.prototype, "init", null);
    AggFuncService = AggFuncService_1 = __decorate([
        Bean('aggFuncService')
    ], AggFuncService);
    return AggFuncService;
}(BeanStub));
export { AggFuncService };
function aggSum(input) {
    return input
        .filter(function (value) { return typeof value === 'number'; })
        .reduce(function (sum, value) { return sum === null ? value : sum + value; }, null);
}
function aggFirst(input) {
    return input.length > 0 ? input[0] : null;
}
function aggLast(input) {
    return input.length > 0 ? _.last(input) : null;
}
function aggMin(input) {
    return input
        .filter(function (value) { return typeof value === 'number'; })
        .reduce(function (min, value) { return min === null || value < min ? value : min; }, null);
}
function aggMax(input) {
    return input
        .filter(function (value) { return typeof value === 'number'; })
        .reduce(function (max, value) { return max === null || value > max ? value : max; }, null);
}
function aggCount(input) {
    var value = input.reduce(function (count, item) {
        var isGroupAgg = _.exists(item) && typeof item.value === 'number';
        return count + (isGroupAgg ? item.value : 1);
    }, 0);
    return {
        value: value,
        toString: function () {
            return this.value.toString();
        },
        // used for sorting
        toNumber: function () {
            return this.value;
        }
    };
}
// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(input) {
    // the average will be the sum / count
    var _a = input.reduce(function (_a, item) {
        var sum = _a.sum, count = _a.count;
        var itemIsGroupResult = _.exists(item) &&
            typeof item.value === 'number' &&
            typeof item.count === 'number';
        if (typeof item === 'number') {
            return { sum: sum + item, count: count + 1 };
        }
        if (itemIsGroupResult) {
            // we are aggregating groups, so we take the
            // aggregated values to calculated a weighted average
            return {
                sum: sum + item.value * item.count,
                count: count + item.count
            };
        }
        return { sum: sum, count: count };
    }, { sum: 0, count: 0 }), sum = _a.sum, count = _a.count;
    // avoid divide by zero error
    var value = count > 0 ? sum / count : null;
    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    return {
        count: count,
        value: value,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function () {
            if (typeof this.value === 'number') {
                return this.value.toString();
            }
            return '';
        },
        // used for sorting
        toNumber: function () {
            return this.value;
        }
    };
}
