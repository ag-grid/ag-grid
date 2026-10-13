import { _exists, _last } from 'ag-stack';

import type { AgColumn, IAggFunc, IAggFuncParams, IAggFuncService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

const defaultAggFuncNames = {
    sum: 'Sum',
    first: 'First',
    last: 'Last',
    min: 'Min',
    max: 'Max',
    count: 'Count',
    avg: 'Average',
} as const;

const DEFAULT_AGG_FUNC_ORDER: DefaultAggFuncName[] = ['sum', 'avg', 'max', 'min', 'count', 'first', 'last'];
type DefaultAggFuncName = keyof typeof defaultAggFuncNames;

export class AggFuncService extends BeanStub implements NamedBean, IAggFuncService {
    beanName = 'aggFuncSvc' as const;

    private readonly aggFuncsMap = new Map<string, IAggFunc>();
    private orderedFuncNames: string[] = [];
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
        const funcMap = this.aggFuncsMap;
        funcMap.set('sum', aggSum);
        funcMap.set('first', aggFirst);
        funcMap.set('last', aggLast);
        const getDateStringParser = this.getDateStringParser.bind(this);
        funcMap.set('min', (params: IAggFuncParams) => aggMinMax(params, false, getDateStringParser));
        funcMap.set('max', (params: IAggFuncParams) => aggMinMax(params, true, getDateStringParser));
        funcMap.set('count', aggCount);
        funcMap.set('avg', aggAvg);
        this.initialised = true;
        this.updateOrderedFuncNames();
    }

    /** Returns the column's date parser when it holds date strings, otherwise `null` so strings are ignored. */
    private getDateStringParser({ column }: IAggFuncParams): DateStringParser | null {
        const dataTypeSvc = this.beans.dataTypeSvc;
        const agColumn = column as AgColumn | undefined;
        if (!dataTypeSvc || !agColumn) {
            return null;
        }
        const baseDataType = dataTypeSvc.getBaseDataType(agColumn);
        if (baseDataType !== 'dateString' && baseDataType !== 'dateTimeString') {
            return null;
        }
        return dataTypeSvc.getDateParserFunction(agColumn);
    }

    public getDefaultFuncLabel(fctName: DefaultAggFuncName): string {
        return defaultAggFuncNames[fctName] ?? fctName;
    }

    public getDefaultAggFunc(column: AgColumn): string | null {
        const defaultAgg = column.colDef.defaultAggFunc;

        const isAggFuncPossible = (func: string) =>
            _exists(this.aggFuncsMap.get(func)) && this.getFuncNames(column).includes(func);

        if (_exists(defaultAgg) && isAggFuncPossible(defaultAgg)) {
            return defaultAgg;
        }

        if (isAggFuncPossible('sum')) {
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
                this.aggFuncsMap.set(key, aggFuncs[key]);
            }
        }
        this.updateOrderedFuncNames();
    }

    public getAggFunc(name: string): IAggFunc {
        this.init();
        return this.aggFuncsMap.get(name)!;
    }

    public getFuncNames(column: AgColumn): string[] {
        return column.colDef.allowedAggFuncs ?? this.orderedFuncNames.slice();
    }

    private updateOrderedFuncNames(): void {
        const result: string[] = [];
        for (const key of DEFAULT_AGG_FUNC_ORDER) {
            if (this.aggFuncsMap.has(key)) {
                result.push(key);
            }
        }
        for (const key of [...this.aggFuncsMap.keys()].sort()) {
            if (!(key in defaultAggFuncNames)) {
                result.push(key);
            }
        }
        this.orderedFuncNames = result;
    }

    public clear(): void {
        this.aggFuncsMap.clear();
        this.orderedFuncNames = [];
    }
}

function aggSum(params: IAggFuncParams): number | bigint {
    const { values } = params;
    let result: any = null; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value === 'number') {
            if (result === null) {
                result = value;
            } else {
                result += typeof result === 'number' ? value : BigInt(value);
            }
        } else if (typeof value === 'bigint') {
            if (result === null) {
                result = value;
            } else {
                result = (typeof result === 'bigint' ? result : BigInt(result)) + value;
            }
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

type DateStringParser = (value: string | undefined) => Date | undefined;

/**
 * Shared implementation of `min` and `max`. Supports numbers and bigints, `Date` objects, and date strings when the
 * column's base data type is `dateString` or `dateTimeString`. Numeric values take precedence: if any are present, the
 * numeric result is returned. Otherwise, the earliest/latest valid date is returned as the original value (never a new
 * instance), so the result keeps the column's type and identity across re-aggregation.
 */
function aggMinMax(
    params: IAggFuncParams,
    isMax: boolean,
    getDateStringParser: (params: IAggFuncParams) => DateStringParser | null
): number | bigint | Date | string | null {
    const { values } = params;
    let numberResult: number | bigint | null = null;
    let dateResult: Date | string | null = null;
    let dateResultTime = 0;
    let dateStringParser: DateStringParser | null | undefined;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value === 'number' || typeof value === 'bigint') {
            if (numberResult === null || (isMax ? numberResult < value : numberResult > value)) {
                numberResult = value;
            }
            continue;
        }

        if (numberResult !== null) {
            continue;
        }

        let time: number;
        if (value instanceof Date) {
            time = value.getTime();
        } else if (typeof value === 'string') {
            // resolved lazily, so columns without string values never pay for the data type lookup
            if (dateStringParser === undefined) {
                dateStringParser = getDateStringParser(params);
            }
            if (!dateStringParser) {
                continue;
            }
            time = dateStringParser(value)?.getTime() ?? NaN;
        } else {
            continue;
        }

        if (!isNaN(time) && (dateResult === null || (isMax ? dateResultTime < time : dateResultTime > time))) {
            dateResult = value;
            dateResultTime = time;
        }
    }

    return numberResult ?? dateResult;
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
    if (existingAggData?.value === count) {
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
function aggAvg(params: IAggFuncParams): {
    value: number | bigint | null;
    count: number;
} {
    const { values } = params;
    let sum: any = 0; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please
    let count = 0;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const currentValue = values[i];
        let valueToAdd: number | bigint | null = null;

        if (typeof currentValue === 'number' || typeof currentValue === 'bigint') {
            valueToAdd = currentValue;
            count++;
        } else if (
            currentValue != null &&
            (typeof currentValue.value === 'number' || typeof currentValue.value === 'bigint') &&
            typeof currentValue.count === 'number'
        ) {
            // we are aggregating groups, so we take the aggregated values to calculated a weighted average
            valueToAdd =
                currentValue.value *
                (typeof currentValue.value === 'number' ? currentValue.count : BigInt(currentValue.count));
            count += currentValue.count;
        }

        if (typeof valueToAdd === 'number') {
            sum += typeof sum === 'number' ? valueToAdd : BigInt(valueToAdd);
        } else if (typeof valueToAdd === 'bigint') {
            sum = (typeof sum === 'bigint' ? sum : BigInt(sum)) + valueToAdd;
        }
    }

    let value: null | number = null;

    // avoid divide by zero error
    if (count > 0) {
        value = sum / ((typeof sum === 'number' ? count : BigInt(count)) as any);
    }

    // the previous aggregation data
    const existingAggData = params.rowNode?.aggData?.[params.column?.getColId()];
    if (existingAggData?.count === count && existingAggData.value === value) {
        // the underlying values haven't changed, return the old object to avoid triggering change detection
        return existingAggData;
    }

    const result = Object.create(AVERAGE_PROTO);
    result.count = count;
    result.value = value;
    return result;
}
