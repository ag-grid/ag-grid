import {
    GroupValueProcessorDefinition,
    ProcessorOutputPropertyDefinition,
    PropertyValueProcessorDefinition,
    ReducerOutputPropertyDefinition,
} from './dataModel';

export const SMALLEST_KEY_INTERVAL: ReducerOutputPropertyDefinition<number> = {
    type: 'reducer',
    property: 'smallestKeyInterval',
    initialValue: Infinity,
    reducer: () => {
        let prevX = NaN;
        return (smallestSoFar, next) => {
            const nextX = next.keys[0];
            const interval = Math.abs(nextX - prevX);
            prevX = nextX;
            if (!isNaN(interval) && interval > 0 && interval < smallestSoFar) {
                return interval;
            }
            return smallestSoFar;
        };
    },
};

export const AGG_VALUES_EXTENT: ProcessorOutputPropertyDefinition<[number, number]> = {
    type: 'processor',
    property: 'aggValuesExtent',
    calculate: (processedData) => {
        const result: [number, number] = [...(processedData.domain.aggValues?.[0] ?? [0, 0])];

        for (const [min, max] of processedData.domain.aggValues?.slice(1) ?? []) {
            if (min < result[0]) {
                result[0] = min;
            }
            if (max > result[1]) {
                result[1] = max;
            }
        }

        return result;
    },
};

export const SORT_DOMAIN_GROUPS: ProcessorOutputPropertyDefinition<any> = {
    type: 'processor',
    property: 'sortedGroupDomain',
    calculate: ({ domain: { groups } }) => {
        if (groups == null) return undefined;

        return [...groups].sort((a, b) => {
            for (let i = 0; i < a.length; i++) {
                const result = a[i] - b[i];
                if (result !== 0) {
                    return result;
                }
            }

            return 0;
        });
    },
};

export function normaliseGroupTo(
    properties: (string | number)[],
    normaliseTo: number,
    mode: 'sum' | 'range' = 'sum'
): GroupValueProcessorDefinition<any, any> {
    const normalise = (val: number, extent: number) => {
        const result = (val * normaliseTo) / extent;
        if (result >= 0) {
            return Math.min(normaliseTo, result);
        }
        return Math.max(-normaliseTo, result);
    };

    return {
        type: 'group-value-processor',
        properties,
        adjust: () => (values: any[], valueIndexes: number[]) => {
            const valuesExtent = [0, 0];
            for (const valueIdx of valueIndexes) {
                const value = values[valueIdx];
                const valIdx = value < 0 ? 0 : 1;
                if (mode === 'sum') {
                    valuesExtent[valIdx] += value;
                } else if (valIdx === 0) {
                    valuesExtent[valIdx] = Math.min(valuesExtent[valIdx], value);
                } else {
                    valuesExtent[valIdx] = Math.max(valuesExtent[valIdx], value);
                }
            }

            const extent = Math.max(Math.abs(valuesExtent[0]), valuesExtent[1]);
            for (const valueIdx of valueIndexes) {
                values[valueIdx] = normalise(values[valueIdx], extent);
            }
        },
    };
}

export function normalisePropertyTo(
    property: string | number,
    normaliseTo: [number, number],
    rangeMin?: number,
    rangeMax?: number
): PropertyValueProcessorDefinition<any> {
    const normaliseSpan = normaliseTo[1] - normaliseTo[0];
    const normalise = (val: number, start: number, span: number) => {
        const result = normaliseTo[0] + ((val - start) / span) * normaliseSpan;

        if (result > normaliseTo[1]) return normaliseTo[1];
        if (result < normaliseTo[0]) return normaliseTo[0];
        return result;
    };

    return {
        type: 'property-value-processor',
        property,
        adjust: () => (pData, pIdx) => {
            let [start, end] = pData.domain.values[pIdx];
            if (rangeMin != null) start = rangeMin;
            if (rangeMax != null) end = rangeMax;
            const span = end - start;

            pData.domain.values[pIdx] = [normaliseTo[0], normaliseTo[1]];

            for (const group of pData.data) {
                let groupValues = group.values;
                if (pData.type === 'ungrouped') {
                    groupValues = [groupValues];
                }
                for (const values of groupValues) {
                    values[pIdx] = normalise(values[pIdx], start, span);
                }
            }
        },
    };
}
