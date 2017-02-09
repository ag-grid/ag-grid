// ag-grid-enterprise v8.0.0
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var AggFuncService = (function () {
    function AggFuncService() {
        this.aggFuncsMap = {};
        this.initialised = false;
    }
    AggFuncService.prototype.init = function () {
        if (this.initialised) {
            return;
        }
        this.initialised = true;
        this.initialiseWithDefaultAggregations();
        this.addAggFuncs(this.gridOptionsWrapper.getAggFuncs());
    };
    AggFuncService.prototype.initialiseWithDefaultAggregations = function () {
        this.aggFuncsMap[AggFuncService.AGG_SUM] = aggSum;
        this.aggFuncsMap[AggFuncService.AGG_FIRST] = aggFirst;
        this.aggFuncsMap[AggFuncService.AGG_LAST] = aggLast;
        this.aggFuncsMap[AggFuncService.AGG_MIN] = aggMin;
        this.aggFuncsMap[AggFuncService.AGG_MAX] = aggMax;
        this.aggFuncsMap[AggFuncService.AGG_COUNT] = aggCount;
        this.aggFuncsMap[AggFuncService.AGG_AVG] = aggAvg;
    };
    AggFuncService.prototype.getDefaultAggFunc = function () {
        if (this.aggFuncsMap[AggFuncService.AGG_SUM]) {
            // use 'sum' if it's still there (ie user has not removed it)
            return AggFuncService.AGG_SUM;
        }
        else {
            var allKeys = this.getFuncNames();
            if (main_1.Utils.existsAndNotEmpty(allKeys)) {
                return allKeys[0];
            }
            else {
                return null;
            }
        }
    };
    AggFuncService.prototype.addAggFuncs = function (aggFuncs) {
        main_1.Utils.iterateObject(aggFuncs, this.addAggFunc.bind(this));
    };
    AggFuncService.prototype.addAggFunc = function (key, aggFunc) {
        this.init();
        this.aggFuncsMap[key] = aggFunc;
    };
    AggFuncService.prototype.getAggFunc = function (name) {
        this.init();
        return this.aggFuncsMap[name];
    };
    AggFuncService.prototype.getFuncNames = function () {
        return Object.keys(this.aggFuncsMap).sort();
    };
    AggFuncService.prototype.clear = function () {
        this.aggFuncsMap = {};
    };
    AggFuncService.AGG_SUM = 'sum';
    AggFuncService.AGG_FIRST = 'first';
    AggFuncService.AGG_LAST = 'last';
    AggFuncService.AGG_MIN = 'min';
    AggFuncService.AGG_MAX = 'max';
    AggFuncService.AGG_COUNT = 'count';
    AggFuncService.AGG_AVG = 'avg';
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], AggFuncService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], AggFuncService.prototype, "init", null);
    AggFuncService = __decorate([
        main_1.Bean('aggFuncService'), 
        __metadata('design:paramtypes', [])
    ], AggFuncService);
    return AggFuncService;
}());
exports.AggFuncService = AggFuncService;
function aggSum(input) {
    var result = null;
    var length = input.length;
    for (var i = 0; i < length; i++) {
        if (typeof input[i] === 'number') {
            if (result === null) {
                result = input[i];
            }
            else {
                result += input[i];
            }
        }
    }
    return result;
}
function aggFirst(input) {
    if (input.length >= 0) {
        return input[0];
    }
    else {
        return null;
    }
}
function aggLast(input) {
    if (input.length >= 0) {
        return input[input.length - 1];
    }
    else {
        return null;
    }
}
function aggMin(input) {
    var result = null;
    var length = input.length;
    for (var i = 0; i < length; i++) {
        if (typeof input[i] === 'number') {
            if (result === null) {
                result = input[i];
            }
            else if (result > input[i]) {
                result = input[i];
            }
        }
    }
    return result;
}
function aggMax(input) {
    var result = null;
    var length = input.length;
    for (var i = 0; i < length; i++) {
        if (typeof input[i] === 'number') {
            if (result === null) {
                result = input[i];
            }
            else if (result < input[i]) {
                result = input[i];
            }
        }
    }
    return result;
}
function aggCount(input) {
    var result = {
        value: 0,
        toString: function () {
            return this.value.toString();
        }
    };
    var length = input.length;
    for (var i = 0; i < length; i++) {
        var isGroupAgg = main_1.Utils.exists(input[i]) && typeof input[i].value === 'number';
        if (isGroupAgg) {
            result.value += input[i].value;
        }
        else {
            result.value++;
        }
    }
    return result;
}
// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(input) {
    // the average will be the sum / count
    var sum = 0;
    var count = 0;
    var length = input.length;
    for (var i = 0; i < length; i++) {
        var currentItem = input[i];
        var itemIsGroupResult = main_1.Utils.exists(currentItem) && typeof currentItem.value === 'number' && typeof currentItem.count === 'number';
        // skip values that are not numbers (ie skip empty values)
        if (typeof currentItem === 'number') {
            sum += currentItem;
            count++;
        }
        else if (itemIsGroupResult) {
            // we are aggregating groups, so we take the
            // aggregated values to calculated a weighted average
            sum += currentItem.value * currentItem.count;
            count += currentItem.count;
        }
    }
    // avoid divide by zero error
    var value = null;
    if (count !== 0) {
        value = sum / count;
    }
    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    var result = {
        count: count,
        value: value,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function () {
            if (typeof this.value === 'number') {
                return this.value.toString();
            }
            else {
                return '';
            }
        }
    };
    return result;
}
