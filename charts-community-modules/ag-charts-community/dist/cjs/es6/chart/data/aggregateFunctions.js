"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trailingAccumulatedValue = exports.accumulatedValue = exports.area = exports.groupAverage = exports.average = exports.groupCount = exports.count = exports.range = exports.groupSum = exports.sum = void 0;
const utilFunctions_1 = require("./utilFunctions");
function sumValues(values, accumulator = [0, 0]) {
    for (const value of values) {
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
    return accumulator;
}
function sum(props) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values),
    };
    return result;
}
exports.sum = sum;
function groupSum(props) {
    return {
        type: 'aggregate',
        properties: props,
        aggregateFunction: (values) => sumValues(values),
        groupAggregateFunction: (next, acc = [0, 0]) => {
            var _a, _b;
            acc[0] += (_a = next === null || next === void 0 ? void 0 : next[0]) !== null && _a !== void 0 ? _a : 0;
            acc[1] += (_b = next === null || next === void 0 ? void 0 : next[1]) !== null && _b !== void 0 ? _b : 0;
            return acc;
        },
    };
}
exports.groupSum = groupSum;
function range(props) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => utilFunctions_1.extendDomain(values),
    };
    return result;
}
exports.range = range;
function count() {
    const result = {
        properties: [],
        type: 'aggregate',
        aggregateFunction: () => [0, 1],
    };
    return result;
}
exports.count = count;
function groupCount() {
    return {
        type: 'aggregate',
        properties: [],
        aggregateFunction: () => [0, 1],
        groupAggregateFunction: (next, acc = [0, 0]) => {
            var _a, _b;
            acc[0] += (_a = next === null || next === void 0 ? void 0 : next[0]) !== null && _a !== void 0 ? _a : 0;
            acc[1] += (_b = next === null || next === void 0 ? void 0 : next[1]) !== null && _b !== void 0 ? _b : 0;
            return acc;
        },
    };
}
exports.groupCount = groupCount;
function average(props) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values).map((v) => v / values.length),
    };
    return result;
}
exports.average = average;
function groupAverage(props) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values),
        groupAggregateFunction: (next, acc = [0, 0, -1]) => {
            var _a, _b;
            acc[0] += (_a = next === null || next === void 0 ? void 0 : next[0]) !== null && _a !== void 0 ? _a : 0;
            acc[1] += (_b = next === null || next === void 0 ? void 0 : next[1]) !== null && _b !== void 0 ? _b : 0;
            acc[2]++;
            return acc;
        },
        finalFunction: (acc = [0, 0, 0]) => {
            const result = acc[0] + acc[1];
            if (result >= 0) {
                return [0, result / acc[2]];
            }
            return [result / acc[2], 0];
        },
    };
    return result;
}
exports.groupAverage = groupAverage;
function area(props, aggFn) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values, keyRange = []) => {
            const keyWidth = keyRange[1] - keyRange[0];
            return aggFn.aggregateFunction(values).map((v) => v / keyWidth);
        },
    };
    if (aggFn.groupAggregateFunction) {
        result.groupAggregateFunction = aggFn.groupAggregateFunction;
    }
    return result;
}
exports.area = area;
function accumulatedValue() {
    return () => {
        let value = 0;
        return (datum) => {
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
    return () => {
        let value = 0;
        return (datum) => {
            if (typeof datum !== 'number')
                return datum;
            if (isNaN(datum))
                return datum;
            const trailingValue = value;
            value += datum;
            return trailingValue;
        };
    };
}
exports.trailingAccumulatedValue = trailingAccumulatedValue;
