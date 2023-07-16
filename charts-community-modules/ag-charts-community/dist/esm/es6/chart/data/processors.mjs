import { memo } from '../../util/memo.mjs';
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
function normaliseFnBuilder({ normaliseTo, mode }) {
    const normalise = (val, extent) => {
        const result = (val * normaliseTo) / extent;
        if (result >= 0) {
            return Math.min(normaliseTo, result);
        }
        return Math.max(-normaliseTo, result);
    };
    return () => () => (values, valueIndexes) => {
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
    };
}
export function normaliseGroupTo(scope, matchGroupIds, normaliseTo, mode = 'sum') {
    return {
        scopes: [scope.id],
        type: 'group-value-processor',
        matchGroupIds,
        adjust: memo({ normaliseTo, mode }, normaliseFnBuilder),
    };
}
function normalisePropertyFnBuilder({ normaliseTo, rangeMin, rangeMax, }) {
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
    return () => (pData, pIdx) => {
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
    };
}
export function normalisePropertyTo(scope, property, normaliseTo, rangeMin, rangeMax) {
    return {
        scopes: [scope.id],
        type: 'property-value-processor',
        property,
        adjust: memo({ normaliseTo, rangeMin, rangeMax }, normalisePropertyFnBuilder),
    };
}
function buildGroupAccFn(mode) {
    return () => () => (values, valueIndexes) => {
        // Datum scope.
        let acc = 0;
        for (const valueIdx of valueIndexes) {
            const currentVal = values[valueIdx];
            if (typeof currentVal !== 'number' || isNaN(currentVal))
                continue;
            if (mode === 'normal')
                acc += currentVal;
            values[valueIdx] = acc;
            if (mode === 'trailing')
                acc += currentVal;
        }
    };
}
function buildGroupWindowAccFn({ mode, sum }) {
    return () => {
        // Entire data-set scope.
        const lastValues = [];
        let firstRow = true;
        return () => {
            // Group scope.
            return (values, valueIndexes) => {
                // Datum scope.
                let acc = 0;
                for (const valueIdx of valueIndexes) {
                    const currentVal = values[valueIdx];
                    const lastValue = firstRow && sum === 'current' ? 0 : lastValues[valueIdx];
                    lastValues[valueIdx] = currentVal;
                    const sumValue = sum === 'current' ? currentVal : lastValue;
                    if (typeof currentVal !== 'number' || isNaN(currentVal)) {
                        values[valueIdx] = sumValue;
                        continue;
                    }
                    if (typeof lastValue !== 'number' || isNaN(lastValue)) {
                        values[valueIdx] = sumValue;
                        continue;
                    }
                    if (mode === 'normal')
                        acc += sumValue;
                    values[valueIdx] = acc;
                    if (mode === 'trailing')
                        acc += sumValue;
                }
                firstRow = false;
            };
        };
    };
}
export function accumulateGroup(scope, matchGroupId, mode, sum) {
    let adjust;
    if (mode.startsWith('window')) {
        const modeParam = mode.endsWith('-trailing') ? 'trailing' : 'normal';
        adjust = memo({ mode: modeParam, sum }, buildGroupWindowAccFn);
    }
    else {
        adjust = memo(mode, buildGroupAccFn);
    }
    return {
        scopes: [scope.id],
        type: 'group-value-processor',
        matchGroupIds: [matchGroupId],
        adjust,
    };
}
export function diff(previousData, updateMovedDatums = true) {
    return {
        type: 'processor',
        property: 'diff',
        calculate: (processedData) => {
            const diff = {
                changed: false,
                added: [],
                updated: [],
                removed: [],
            };
            const added = new Map();
            const updated = new Map();
            const removed = new Map();
            const sep = '___';
            for (let i = 0; i < Math.max(previousData.data.length, processedData.data.length); i++) {
                const prev = previousData.data[i];
                const datum = processedData.data[i];
                const prevId = prev === null || prev === void 0 ? void 0 : prev.keys.join(sep);
                const datumId = datum === null || datum === void 0 ? void 0 : datum.keys.join(sep);
                if (prevId === datumId) {
                    if (!arraysEqual(prev.values, datum.values)) {
                        updated.set(datumId, datum);
                    }
                    continue;
                }
                if (removed.has(datumId)) {
                    if (updateMovedDatums || !arraysEqual(removed.get(datumId).values, datum.values)) {
                        updated.set(datumId, datum);
                    }
                    removed.delete(datumId);
                }
                else if (datum) {
                    added.set(datumId, datum);
                }
                if (added.has(prevId)) {
                    if (updateMovedDatums || !arraysEqual(added.get(prevId).values, prev.values)) {
                        updated.set(prevId, prev);
                    }
                    added.delete(prevId);
                }
                else if (prev) {
                    removed.set(prevId, prev);
                }
            }
            diff.added = Array.from(added.values()).map((datum) => datum.keys);
            diff.updated = Array.from(updated.values()).map((datum) => datum.keys);
            diff.removed = Array.from(removed.values()).map((datum) => datum.keys);
            diff.changed = diff.added.length > 0 || diff.updated.length > 0 || diff.removed.length > 0;
            return diff;
        },
    };
}
function arraysEqual(a, b) {
    if (a == null || b == null)
        return false;
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i]) && Array.isArray(b[i]))
            return arraysEqual(a[i], b[i]);
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
