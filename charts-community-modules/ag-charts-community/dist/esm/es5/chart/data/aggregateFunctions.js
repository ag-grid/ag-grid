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
import { extendDomain } from './utilFunctions';
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
export function sum(props) {
    var result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: function (values) { return sumValues(values); },
    };
    return result;
}
export function groupSum(props) {
    return {
        type: 'aggregate',
        properties: props,
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
export function range(props) {
    var result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: function (values) { return extendDomain(values); },
    };
    return result;
}
export function count() {
    var result = {
        properties: [],
        type: 'aggregate',
        aggregateFunction: function () { return [0, 1]; },
    };
    return result;
}
export function groupCount() {
    return {
        type: 'aggregate',
        properties: [],
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
export function average(props) {
    var result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: function (values) { return sumValues(values).map(function (v) { return v / values.length; }); },
    };
    return result;
}
export function groupAverage(props) {
    var result = {
        properties: props,
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
export function area(props, aggFn) {
    var result = {
        properties: props,
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
export function accumulatedValue() {
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
export function trailingAccumulatedValue() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRlRnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2RhdGEvYWdncmVnYXRlRnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0EsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSS9DLFNBQVMsU0FBUyxDQUFDLE1BQWEsRUFBRSxXQUFnRDs7SUFBaEQsNEJBQUEsRUFBQSxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBNkI7O1FBQzlFLEtBQW9CLElBQUEsV0FBQSxTQUFBLE1BQU0sQ0FBQSw4QkFBQSxrREFBRTtZQUF2QixJQUFNLEtBQUssbUJBQUE7WUFDWixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDM0IsU0FBUzthQUNaO1lBQ0QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO2dCQUNYLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7YUFDM0I7WUFDRCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQ1gsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQzthQUMzQjtTQUNKOzs7Ozs7Ozs7SUFFRCxPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBSSxLQUFVO0lBQzdCLElBQU0sTUFBTSxHQUEwQztRQUNsRCxVQUFVLEVBQUUsS0FBSztRQUNqQixJQUFJLEVBQUUsV0FBVztRQUNqQixpQkFBaUIsRUFBRSxVQUFDLE1BQU0sSUFBSyxPQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBakIsQ0FBaUI7S0FDbkQsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFJLEtBQVU7SUFDbEMsT0FBTztRQUNILElBQUksRUFBRSxXQUFXO1FBQ2pCLFVBQVUsRUFBRSxLQUFLO1FB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