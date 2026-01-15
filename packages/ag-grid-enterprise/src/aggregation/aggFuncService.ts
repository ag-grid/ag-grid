import type { AgColumn, IAggFunc, IAggFuncParams, IAggFuncService, NamedBean } from 'ag-grid-community';
import { BeanStub, _exists, _last } from 'ag-grid-community';

const defaultAggFuncNames = {
    sum: 'Sum',
    first: 'First',
    last: 'Last',
    min: 'Min',
    max: 'Max',
    count: 'Count',
    avg: 'Average',
} as const;
type DefaultAggFuncName = keyof typeof defaultAggFuncNames;

export class AggFuncService extends BeanStub implements NamedBean, IAggFuncService {
    beanName = 'aggFuncSvc' as const;

    private aggFuncsMap: { [key in string]: IAggFunc } = {};
    private initialised = false;

    public postConstruct(): void {
        this.init();
    }

    private init() {
        if (this.initialised) {
            return;
        }

        this.initialiseWithDefaultAggregations();
        this.addAggFuncs(this.gos.get('aggFuncs'));
    }

    private initialiseWithDefaultAggregations(): void {
        const aggMap = this.aggFuncsMap as { [key in DefaultAggFuncName]: IAggFunc };
        aggMap['sum'] = aggSum;
        aggMap['first'] = aggFirst;
        aggMap['last'] = aggLast;
        aggMap['min'] = aggMin;
        aggMap['max'] = aggMax;
        aggMap['count'] = aggCount;
        aggMap['avg'] = aggAvg;
        this.initialised = true;
    }

    private isAggFuncPossible(column: AgColumn, func: string): boolean {
        const allKeys = this.getFuncNames(column);
        const allowed = allKeys.includes(func);
        const funcExists = _exists(this.aggFuncsMap[func]);
        return allowed && funcExists;
    }

    public getDefaultFuncLabel(fctName: DefaultAggFuncName): string {
        return defaultAggFuncNames[fctName] ?? fctName;
    }

    public getDefaultAggFunc(column: AgColumn): string | null {
        const defaultAgg = column.getColDef().defaultAggFunc;

        if (_exists(defaultAgg) && this.isAggFuncPossible(column, defaultAgg)) {
            return defaultAgg;
        }

        if (this.isAggFuncPossible(column, 'sum')) {
            return 'sum';
        }

        const allKeys = this.getFuncNames(column);
        return allKeys?.length ? allKeys[0] : null;
    }

    public addAggFuncs(aggFuncs?: { [key: string]: IAggFunc }): void {
        this.init();
        if (!aggFuncs) {
            return;
        }
        for (const key of Object.keys(aggFuncs)) {
            if (aggFuncs[key]) {
                this.aggFuncsMap[key] = aggFuncs[key];
            }
        }
    }

    public getAggFunc(name: string): IAggFunc {
        this.init();
        return this.aggFuncsMap[name];
    }

    public getFuncNames(column: AgColumn): string[] {
        const userAllowedFuncs = column.getColDef().allowedAggFuncs;

        return userAllowedFuncs == null ? Object.keys(this.aggFuncsMap).sort() : userAllowedFuncs;
    }

    public clear(): void {
        this.aggFuncsMap = {};
    }
}

function aggSum(params: IAggFuncParams): number | bigint | null {
    const { values } = params;
    let result: number | bigint | null = null;
    let useBigInt = false;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value !== 'number' && typeof value !== 'bigint') {
            continue;
        }

        if (typeof value === 'bigint') {
            if (!useBigInt) {
                useBigInt = true;
                if (typeof result === 'number') {
                    const coercedResult = toBigIntFromNumber(result);
                    if (coercedResult == null) {
                        return null;
                    }
                    result = coercedResult;
                }
            }
            result = result === null ? value : (result as bigint) + value;
        } else if (!useBigInt) {
            result = result === null ? value : (result as number) + value;
        } else {
            const coercedValue = toBigIntFromNumber(value);
            if (coercedValue == null) {
                return null;
            }
            result = result === null ? coercedValue : (result as bigint) + coercedValue;
        }
    }

    return result;
}

function aggFirst(params: IAggFuncParams): any {
    return params.values.length > 0 ? params.values[0] : null;
}

function aggLast(params: IAggFuncParams): any {
    return params.values.length > 0 ? _last(params.values) : null;
}

function aggMin(params: IAggFuncParams): number | bigint | null {
    const { values } = params;
    let result: number | bigint | null = null;
    let useBigInt = false;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value !== 'number' && typeof value !== 'bigint') {
            continue;
        }

        if (typeof value === 'bigint') {
            if (!useBigInt) {
                useBigInt = true;
                if (typeof result === 'number') {
                    const coercedResult = toBigIntFromNumber(result);
                    if (coercedResult == null) {
                        return null;
                    }
                    result = coercedResult;
                }
            }
            if (result === null || (result as bigint) > value) {
                result = value;
            }
        } else if (!useBigInt) {
            if (result === null || (result as number) > value) {
                result = value;
            }
        } else {
            const coercedValue = toBigIntFromNumber(value);
            if (coercedValue == null) {
                return null;
            }
            if (result === null || (result as bigint) > coercedValue) {
                result = coercedValue;
            }
        }
    }

    return result;
}

function aggMax(params: IAggFuncParams): number | bigint | null {
    const { values } = params;
    let result: number | bigint | null = null;
    let useBigInt = false;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value !== 'number' && typeof value !== 'bigint') {
            continue;
        }

        if (typeof value === 'bigint') {
            if (!useBigInt) {
                useBigInt = true;
                if (typeof result === 'number') {
                    const coercedResult = toBigIntFromNumber(result);
                    if (coercedResult == null) {
                        return null;
                    }
                    result = coercedResult;
                }
            }
            if (result === null || (result as bigint) < value) {
                result = value;
            }
        } else if (!useBigInt) {
            if (result === null || (result as number) < value) {
                result = value;
            }
        } else {
            const coercedValue = toBigIntFromNumber(value);
            if (coercedValue == null) {
                return null;
            }
            if (result === null || (result as bigint) < coercedValue) {
                result = coercedValue;
            }
        }
    }

    return result;
}

// Proto used to reduce memory impact from repeat function instantiation
const COUNT_PROTO = Object.freeze({
    // the grid by default uses toString to render values for an object, so this
    // is a trick to get the default cellRenderer to display the avg value
    toString: function () {
        return this.value.toString();
    },
    // used for sorting
    toNumber: function () {
        return this.value;
    },
} as any);

function aggCount(params: IAggFuncParams) {
    const { values } = params;
    let count = 0;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        // check if the value is from a group, in which case use the group's count
        count += value != null && typeof value.value === 'number' ? value.value : 1;
    }

    // the previous aggregation data
    const existingAggData = params.rowNode?.aggData?.[params.column.getColId()];
    if (existingAggData && existingAggData.value === count) {
        // the underlying values haven't changed, return the old object to avoid triggering change detection
        return existingAggData;
    }

    // it's important to wrap it in the object so we can determine if this is a group level
    const result = Object.create(COUNT_PROTO);
    result.value = count;
    return result;
}

// Proto used to reduce memory impact from repeat function instantiation
const AVERAGE_PROTO = Object.freeze({
    // the grid by default uses toString to render values for an object, so this
    // is a trick to get the default cellRenderer to display the avg value
    toString: function () {
        return typeof this.value === 'number' || typeof this.value === 'bigint' ? this.value.toString() : '';
    },
    // used for sorting
    toNumber: function () {
        return this.value;
    },
} as any);

// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(params: IAggFuncParams): { value: number | bigint | null; count: number } | null {
    const { values } = params;
    let sum = 0;
    let sumBigInt = 0n;
    let count = 0;
    let useBigInt = false;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const currentValue = values[i];
        if (typeof currentValue === 'bigint') {
            if (!useBigInt) {
                useBigInt = true;
                const coercedSum = toBigIntFromNumber(sum);
                if (coercedSum == null) {
                    return null;
                }
                sumBigInt = coercedSum;
            }
            sumBigInt += currentValue;
            count++;
            continue;
        }

        if (typeof currentValue === 'number') {
            if (useBigInt) {
                const coercedValue = toBigIntFromNumber(currentValue);
                if (coercedValue == null) {
                    return null;
                }
                sumBigInt += coercedValue;
            } else {
                sum += currentValue;
            }
            count++;
            continue;
        }

        if (
            currentValue != null &&
            (typeof currentValue.value === 'number' || typeof currentValue.value === 'bigint') &&
            typeof currentValue.count === 'number'
        ) {
            if (typeof currentValue.value === 'bigint') {
                if (!useBigInt) {
                    useBigInt = true;
                    const coercedSum = toBigIntFromNumber(sum);
                    if (coercedSum == null) {
                        return null;
                    }
                    sumBigInt = coercedSum;
                }
                sumBigInt += currentValue.value * BigInt(currentValue.count);
            } else if (useBigInt) {
                const weightedValue = currentValue.value * currentValue.count;
                const coercedValue = toBigIntFromNumber(weightedValue);
                if (coercedValue == null) {
                    return null;
                }
                sumBigInt += coercedValue;
            } else {
                sum += currentValue.value * currentValue.count;
            }
            count += currentValue.count;
        }
    }

    let value: null | number | bigint = null;

    // avoid divide by zero error
    if (count > 0) {
        value = useBigInt ? sumBigInt / BigInt(count) : sum / count;
    }

    // the previous aggregation data
    const existingAggData = params.rowNode?.aggData?.[params.column?.getColId()];
    if (existingAggData && existingAggData.count === count && existingAggData.value === value) {
        // the underlying values haven't changed, return the old object to avoid triggering change detection
        return existingAggData;
    }

    const result = Object.create(AVERAGE_PROTO);
    result.count = count;
    result.value = value;
    return result;
}

function toBigIntFromNumber(value: number): bigint | null {
    if (!isFinite(value) || !Number.isInteger(value)) {
        return null;
    }
    return BigInt(value);
}
