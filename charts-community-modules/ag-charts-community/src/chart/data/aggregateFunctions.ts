import { AggregatePropertyDefinition } from './dataModel';

type ContinuousDomain<T extends number | Date> = [T, T];

export function sumValues(values: any[], accumulator = [0, 0] as ContinuousDomain<number>) {
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

export function sum<K>(props: K[]) {
    const result: AggregatePropertyDefinition<any, any> = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values),
    };

    return result;
}

export function groupSum<K>(props: K[]): AggregatePropertyDefinition<any, any, [number, number]> {
    return {
        type: 'aggregate',
        properties: props,
        aggregateFunction: (values) => sumValues(values),
        groupAggregateFunction: (next, acc = [0, 0]) => {
            acc[0] += next?.[0] ?? 0;
            acc[1] += next?.[1] ?? 0;
            return acc;
        },
    };
}

export function count() {
    const result: AggregatePropertyDefinition<any, any> = {
        properties: [],
        type: 'aggregate',
        aggregateFunction: () => [0, 1],
    };

    return result;
}

export function groupCount(): AggregatePropertyDefinition<any, any, [number, number]> {
    return {
        type: 'aggregate',
        properties: [],
        aggregateFunction: () => [0, 1],
        groupAggregateFunction: (next, acc = [0, 0]) => {
            acc[0] += next?.[0] ?? 0;
            acc[1] += next?.[1] ?? 0;
            return acc;
        },
    };
}

export function average<K>(props: K[]) {
    const result: AggregatePropertyDefinition<any, any> = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values).map((v) => v / values.length) as [number, number],
    };

    return result;
}

export function groupAverage<K>(props: K[]) {
    const result: AggregatePropertyDefinition<any, any, [number, number], [number, number, number]> = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values) => sumValues(values),
        groupAggregateFunction: (next, acc = [0, 0, -1]) => {
            acc[0] += next?.[0] ?? 0;
            acc[1] += next?.[1] ?? 0;
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

// export function groupAverage<K>(props: K[]): AggregatePropertyDefinition<any, any> {
//     return {
//         properties: props,
//         type: 'aggregate',
//         aggregateFunction: (values) => [...sumValues(values), 1],
//         groupAggregateFunction: (next, acc = [0, 0, 0]) => {
//             acc[0] += next?.[0] ?? 0;
//             acc[1] += next?.[1] ?? 0;
//             return acc;
//         },
//     };
// }

export function area<K>(props: K[], aggFn: AggregatePropertyDefinition<any, any>) {
    const result: AggregatePropertyDefinition<any, any> = {
        properties: props,
        type: 'aggregate',
        aggregateFunction: (values, keyRange = []) => {
            const keyWidth = keyRange[1] - keyRange[0];
            return aggFn.aggregateFunction(values).map((v) => v / keyWidth) as [number, number];
        },
    };

    if (aggFn.groupAggregateFunction) {
        result.groupAggregateFunction = aggFn.groupAggregateFunction;
    }

    return result;
}
