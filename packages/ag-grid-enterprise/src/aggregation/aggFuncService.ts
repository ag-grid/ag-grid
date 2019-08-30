import {
    Autowired,
    Bean,
    Column,
    GridOptionsWrapper,
    IAggFunc,
    IAggFuncService,
    PostConstruct,
    _
} from "ag-grid-community";

@Bean('aggFuncService')
export class AggFuncService implements IAggFuncService {

    private static AGG_SUM = 'sum';
    private static AGG_FIRST = 'first';
    private static AGG_LAST = 'last';
    private static AGG_MIN = 'min';
    private static AGG_MAX = 'max';
    private static AGG_COUNT = 'count';
    private static AGG_AVG = 'avg';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    private aggFuncsMap: { [key: string]: IAggFunc } = {};

    private initialised = false;

    @PostConstruct
    private init() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        this.initialiseWithDefaultAggregations();
        this.addAggFuncs(this.gridOptionsWrapper.getAggFuncs());
    }

    private initialiseWithDefaultAggregations(): void {
        this.aggFuncsMap[AggFuncService.AGG_SUM] = aggSum;
        this.aggFuncsMap[AggFuncService.AGG_FIRST] = aggFirst;
        this.aggFuncsMap[AggFuncService.AGG_LAST] = aggLast;
        this.aggFuncsMap[AggFuncService.AGG_MIN] = aggMin;
        this.aggFuncsMap[AggFuncService.AGG_MAX] = aggMax;
        this.aggFuncsMap[AggFuncService.AGG_COUNT] = aggCount;
        this.aggFuncsMap[AggFuncService.AGG_AVG] = aggAvg;
    }

    public getDefaultAggFunc(column: Column): string | null {

        const allKeys = this.getFuncNames(column);

        // use 'sum' if it's a) allowed for the column and b) still registered
        // (ie not removed by user)
        const sumInKeysList = allKeys.indexOf(AggFuncService.AGG_SUM) >= 0;
        const sumInFuncs = _.exists(this.aggFuncsMap[AggFuncService.AGG_SUM]);

        const useSum = sumInKeysList && sumInFuncs;

        if (useSum) {
            return AggFuncService.AGG_SUM;
        } else {
            if (_.existsAndNotEmpty(allKeys)) {
                return allKeys[0];
            } else {
                return null;
            }
        }
    }

    public addAggFuncs(aggFuncs: { [key: string]: IAggFunc } | undefined): void {
        _.iterateObject(aggFuncs, this.addAggFunc.bind(this));
    }

    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        this.init();
        this.aggFuncsMap[key] = aggFunc;
    }

    public getAggFunc(name: string): IAggFunc {
        this.init();
        return this.aggFuncsMap[name];
    }

    public getFuncNames(column: Column): string[] {
        const userAllowedFuncs = column.getColDef().allowedAggFuncs;
        if (_.exists(userAllowedFuncs) && userAllowedFuncs) {
            return userAllowedFuncs;
        } else {
            return Object.keys(this.aggFuncsMap).sort();
        }
    }

    public clear(): void {
        this.aggFuncsMap = {};
    }
}

function aggSum(input: any[]): any {
    let result: number | null = null;
    const length = input.length;
    for (let i = 0; i < length; i++) {
        if (typeof input[i] === 'number') {
            if (result === null) {
                result = input[i];
            } else {
                result += input[i];
            }
        }
    }
    return result;
}

function aggFirst(input: any[]): any {
    if (input.length >= 0) {
        return input[0];
    } else {
        return null;
    }
}

function aggLast(input: any[]): any {
    if (input.length >= 0) {
        return _.last(input);
    } else {
        return null;
    }
}

function aggMin(input: any[]): any {
    let result: number | null = null;
    const length = input.length;
    for (let i = 0; i < length; i++) {
        if (typeof input[i] === 'number') {
            if (result === null) {
                result = input[i];
            } else if (result > input[i]) {
                result = input[i];
            }
        }
    }
    return result;
}

function aggMax(input: any[]): any {
    let result: number | null = null;
    const length = input.length;
    for (let i = 0; i < length; i++) {
        if (typeof input[i] === 'number') {
            if (result === null) {
                result = input[i];
            } else if (result < input[i]) {
                result = input[i];
            }
        }
    }
    return result;
}

function aggCount(input: any[]): any {
    const result = {
        value: 0,
        toString: function() {
            return this.value.toString();
        },
        // used for sorting
        toNumber: function() {
            return this.value;
        }
    };
    const length = input.length;
    for (let i = 0; i < length; i++) {
        const isGroupAgg = _.exists(input[i]) && typeof input[i].value === 'number';
        if (isGroupAgg) {
            result.value += input[i].value;
        } else {
            result.value++;
        }
    }
    return result;
}

// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(input: any[]): any {

    // the average will be the sum / count
    let sum = 0;
    let count = 0;

    const length = input.length;
    for (let i = 0; i < length; i++) {

        const currentItem = input[i];

        const itemIsGroupResult = _.exists(currentItem) && typeof currentItem.value === 'number' && typeof currentItem.count === 'number';

        // skip values that are not numbers (ie skip empty values)
        if (typeof currentItem === 'number') {
            sum += currentItem;
            count++;
            // check if it's a group (ie value is a wrapper object)
        } else if (itemIsGroupResult) {
            // we are aggregating groups, so we take the
            // aggregated values to calculated a weighted average
            sum += currentItem.value * currentItem.count;
            count += currentItem.count;
        }
    }

    // avoid divide by zero error
    let value: number | null = null;
    if (count !== 0) {
        value = sum / count;
    }

    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    const result = {
        count: count,
        value: value,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function() {
            if (typeof this.value === 'number') {
                return this.value.toString();
            } else {
                return '';
            }
        },
        // used for sorting
        toNumber: function() {
            return this.value;
        }
    };

    return result;
}
