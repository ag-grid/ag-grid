export const SMALLEST_KEY_INTERVAL = {
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
export const AGG_VALUES_EXTENT = {
    type: 'processor',
    property: 'aggValuesExtent',
    calculate: (processedData) => {
        var _a, _b, _c, _d;
        const result = [...((_b = (_a = processedData.domain.aggValues) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : [0, 0])];
        for (const [min, max] of (_d = (_c = processedData.domain.aggValues) === null || _c === void 0 ? void 0 : _c.slice(1)) !== null && _d !== void 0 ? _d : []) {
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
export const SORT_DOMAIN_GROUPS = {
    type: 'processor',
    property: 'sortedGroupDomain',
    calculate: ({ domain: { groups } }) => {
        if (groups == null)
            return undefined;
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
export function normaliseGroupTo(properties, normaliseTo, mode = 'sum') {
    const normalise = (val, extent) => {
        const result = (val * normaliseTo) / extent;
        if (result >= 0) {
            return Math.min(normaliseTo, result);
        }
        return Math.max(-normaliseTo, result);
    };
    return {
        type: 'group-value-processor',
        properties,
        adjust: () => (values, valueIndexes) => {
            const valuesExtent = [0, 0];
            for (const valueIdx of valueIndexes) {
                const value = values[valueIdx];
                const valIdx = value < 0 ? 0 : 1;
                if (mode === 'sum') {
                    valuesExtent[valIdx] += value;
                }
                else if (valIdx === 0) {
                    valuesExtent[valIdx] = Math.min(valuesExtent[valIdx], value);
                }
                else {
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
export function normalisePropertyTo(property, normaliseTo, rangeMin, rangeMax) {
    const normaliseSpan = normaliseTo[1] - normaliseTo[0];
    const normalise = (val, start, span) => {
        const result = normaliseTo[0] + ((val - start) / span) * normaliseSpan;
        if (span === 0)
            return normaliseTo[1];
        if (result >= normaliseTo[1])
            return normaliseTo[1];
        if (result < normaliseTo[0])
            return normaliseTo[0];
        return result;
    };
    return {
        type: 'property-value-processor',
        property,
        adjust: () => (pData, pIdx) => {
            let [start, end] = pData.domain.values[pIdx];
            if (rangeMin != null)
                start = rangeMin;
            if (rangeMax != null)
                end = rangeMax;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc29ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9kYXRhL3Byb2Nlc3NvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQTRDO0lBQzFFLElBQUksRUFBRSxTQUFTO0lBQ2YsUUFBUSxFQUFFLHFCQUFxQjtJQUMvQixZQUFZLEVBQUUsUUFBUTtJQUN0QixPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ1YsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztZQUN6QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLFFBQVEsR0FBRyxhQUFhLEVBQUU7Z0JBQzlELE9BQU8sUUFBUSxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxhQUFhLENBQUM7UUFDekIsQ0FBQyxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBd0Q7SUFDbEYsSUFBSSxFQUFFLFdBQVc7SUFDakIsUUFBUSxFQUFFLGlCQUFpQjtJQUMzQixTQUFTLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTs7UUFDekIsTUFBTSxNQUFNLEdBQXFCLENBQUMsR0FBRyxDQUFDLE1BQUEsTUFBQSxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsMENBQUcsQ0FBQyxDQUFDLG1DQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV0RixLQUFLLE1B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