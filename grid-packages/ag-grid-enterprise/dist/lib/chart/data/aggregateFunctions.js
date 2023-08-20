"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.trailingAccumulatedValue = exports.accumulatedValue = exports.area = exports.groupAverage = exports.average = exports.groupCount = exports.count = exports.range = exports.groupSum = exports.sum = void 0;
var utilFunctions_1 = require("./utilFunctions");
function sumValues(values, accumulator) {
    var e_1, _a;
    if (accumulator === void 0) { accumulator = [0, 0]; }
    try {
        for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
            var value = values_1_1.value;
            if (typeof value !== 'number') {
                continue;
            }
            if (value < 0) {
                accumulator[0] += value;
            }
            if (value > 0) {
                accumulator[1] += value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return accumulator;
}
function sum(scope, id, matchGroupId) {
    var result = {
        id: id,
        scopes: [scope.id],
        matchGroupIds: [matchGroupId],
        type: 'aggregate',
        aggregateFunction: function (values) { return sumValues(values); },
    };
    return result;
}
exports.sum = sum;
function groupSum(scope, id, matchGroupId) {
    return {
        id: id,
        scopes: [scope.id],
        type: 'aggregate',
        matchGroupIds: matchGroupId ? [matchGroupId] : undefined,
        aggregateFunction: function (values) { return sumValues(values); },
        groupAggregateFunction: function (next, acc) {
            var _a, _b;
            if (acc === void 0) { acc = [0, 0]; }
            acc[0] += (_a = next === null || next === void 0 ? void 0 : next[0]) !== null && _a !== void 0 ? _a : 0;
            acc[1] += (_b = next === null || next === void 0 ? void 0 : next[1]) !== null && _b !== void 0 ? _b : 0;
            return acc;
        },
    };
}
exports.groupSum = groupSum;
function range(scope, id, matchGroupId) {
    var result = {
        id: id,
        scopes: [scope.id],
        matchGroupIds: [matchGroupId],
        type: 'aggregate',
        aggregateFunction: function (values) { return utilFunctions_1.extendDomain(values); },
    };
    return result;
}
exports.range = range;
function count(scope, id) {
    var result = {
        id: id,
        scopes: [scope.id],
        type: 'aggregate',
        aggregateFunction: function () { return [0, 1]; },
    };
    return result;
}
exports.count = count;
function groupCount(scope, id) {
    return {
        id: id,
        scopes: [scope.id],
        type: 'aggregate',
        aggregateFunction: function () { return [0, 1]; },
        groupAggregateFunction: function (next, acc) {
            var _a, _b;
            if (acc === void 0) { acc = [0, 0]; }
            acc[0] += (_a = next === null || next === void 0 ? void 0 : next[0]) !== null && _a !== void 0 ? _a : 0;
            acc[1] += (_b = next === null || next === void 0 ? void 0 : next[1]) !== null && _b !== void 0 ? _b : 0;
            return acc;
        },
    };
}
exports.groupCount = groupCount;
function average(scope, id, matchGroupId) {
    var result = {
        id: id,
        scopes: [scope.id],
        matchGroupIds: [matchGroupId],
        type: 'aggregate',
        aggregateFunction: function (values) { return sumValues(values).map(function (v) { return v / values.length; }); },
    };
    return result;
}
exports.average = average;
function groupAverage(scope, id, matchGroupId) {
    var result = {
        id: id,
        scopes: [scope.id],
        matchGroupIds: matchGroupId ? [matchGroupId] : undefined,
        type: 'aggregate',
        aggregateFunction: function (values) { return sumValues(values); },
        groupAggregateFunction: function (next, acc) {
            var _a, _b;
            if (acc === void 0) { acc = [0, 0, -1]; }
            acc[0] += (_a = next === null || next === void 0 ? void 0 : next[0]) !== null && _a !== void 0 ? _a : 0;
            acc[1] += (_b = next === null || next === void 0 ? void 0 : next[1]) !== null && _b !== void 0 ? _b : 0;
            acc[2]++;
            return acc;
        },
        finalFunction: function (acc) {
            if (acc === void 0) { acc = [0, 0, 0]; }
            var result = acc[0] + acc[1];
            if (result >= 0) {
                return [0, result / acc[2]];
            }
            return [result / acc[2], 0];
        },
    };
    return result;
}
exports.groupAverage = groupAverage;
function area(scope, id, aggFn, matchGroupId) {
    var result = {
        id: id,
        scopes: [scope.id],
        matchGroupIds: matchGroupId ? [matchGroupId] : undefined,
        type: 'aggregate',
        aggregateFunction: function (values, keyRange) {
            if (keyRange === void 0) { keyRange = []; }
            var keyWidth = keyRange[1] - keyRange[0];
            return aggFn.aggregateFunction(values).map(function (v) { return v / keyWidth; });
        },
    };
    if (aggFn.groupAggregateFunction) {
        result.groupAggregateFunction = aggFn.groupAggregateFunction;
    }
    return result;
}
exports.area = area;
function accumulatedValue() {
    return function () {
        var value = 0;
        return function (datum) {
            if (typeof datum !== 'number')
                return datum;
            if (isNaN(datum))
                return datum;
            value += datum;
            return value;
        };
    };
}
exports.accumulatedValue = accumulatedValue;
function trailingAccumulatedValue() {
    return function () {
        var value = 0;
        return function (datum) {
            if (typeof datum !== 'number')
                return datum;
            if (isNaN(datum))
                return datum;
            var trailingValue = value;
            value += datum;
            return trailingValue;
        };
    };
}
exports.trailingAccumulatedValue = trailingAccumulatedValue;
//# sourceMappingURL=aggregateFunctions.js.map