import { extendDomain } from './utilFunctions';
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
export function sum(props) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values),
    };
    return result;
}
export function groupSum(props) {
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
export function range(props) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => extendDomain(values),
    };
    return result;
}
export function count() {
    const result = {
        properties: [],
        type: 'aggregate',
        aggregateFunction: () => [0, 1],
    };
    return result;
}
export function groupCount() {
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
export function average(props) {
    const result = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values).map((v) => v / values.length),
    };
    return result;
}
export function groupAverage(props) {
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
export function area(props, aggFn) {
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
export function accumulatedValue() {
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
export function trailingAccumulatedValue() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRlRnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2RhdGEvYWdncmVnYXRlRnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUkvQyxTQUFTLFNBQVMsQ0FBQyxNQUFhLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQTZCO0lBQzlFLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQ3hCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzNCLFNBQVM7U0FDWjtRQUNELElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNYLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7U0FDM0I7UUFDRCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDWCxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1NBQzNCO0tBQ0o7SUFFRCxPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBSSxLQUFVO0lBQzdCLE1BQU0sTUFBTSxHQUEwQztRQUNsRCxVQUFVLEVBQUUsS0FBSztRQUNqQixJQUFJLEVBQUUsV0FBVztRQUNqQixpQkFBaUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztLQUNuRCxDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUVELE1BQU0sVUFBVSxRQUFRLENBQUksS0FBVTtJQUNsQyxPQUFPO1FBQ0gsSUFBSSxFQUFFLFdBQVc7UUFDakIsVUFBVSxFQUFFLEtBQUs7UUFDakIsaUJBQWlCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDaEQsc0JBQXNCLEVBQUUsQ0FBQyxJQUFJ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