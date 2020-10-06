import {
    Autowired,
    Bean,
    BeanStub,
    Column,
    GridOptionsWrapper,
    IAggFunc,
    IAggFuncService,
    PostConstruct,
    _,
    IAggFuncParams
} from "@ag-grid-community/core";

@Bean('aggFuncService')
export class AggFuncService extends BeanStub implements IAggFuncService {

    private static AGG_SUM = 'sum';
    private static AGG_FIRST = 'first';
    private static AGG_LAST = 'last';
    private static AGG_MIN = 'min';
    private static AGG_MAX = 'max';
    private static AGG_COUNT = 'count';
    private static AGG_AVG = 'avg';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private aggFuncsMap: { [key: string]: IAggFunc; } = {};
    private initialised = false;

    @PostConstruct
    private init() {
        if (this.initialised) {
            return;
        }

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
        this.initialised = true;
    }

    public getDefaultAggFunc(column: Column): string | null {
        const allKeys = this.getFuncNames(column);

        // use 'sum' if it's a) allowed for the column and b) still registered
        // (ie not removed by user)
        const sumInKeysList = _.includes(allKeys, AggFuncService.AGG_SUM);
        const sumInFuncs = _.exists(this.aggFuncsMap[AggFuncService.AGG_SUM]);

        if (sumInKeysList && sumInFuncs) {
            return AggFuncService.AGG_SUM;
        }

        return _.existsAndNotEmpty(allKeys) ? allKeys[0] : null;
    }

    public addAggFuncs(aggFuncs?: { [key: string]: IAggFunc; }): void {
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

        return userAllowedFuncs == null ? Object.keys(this.aggFuncsMap).sort() : userAllowedFuncs;
    }

    public clear(): void {
        this.aggFuncsMap = {};
    }
}

function aggSum(params: IAggFuncParams): any {
    const { values } = params;
    let result = null;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value === 'number') {
            if (result === null) {
                result = value;
            } else {
                result += value;
            }
        }
    }

    return result;
}

function aggFirst(params: IAggFuncParams): any {
    return params.values.length > 0 ? params.values[0] : null;
}

function aggLast(params: IAggFuncParams): any {
    return params.values.length > 0 ? _.last(params.values) : null;
}

function aggMin(params: IAggFuncParams): any {
    const { values } = params;
    let result = null;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value === 'number' && (result === null || result > value)) {
            result = value;
        }
    }

    return result;
}

function aggMax(params: IAggFuncParams): any {
    const { values } = params;
    let result = null;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value === 'number' && (result === null || result < value)) {
            result = value;
        }
    }

    return result;
}

function aggCount(params: IAggFuncParams): any {
    const { values } = params;
    let result = 0;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        // check if the value is from an aggregated group
        result += value != null && typeof value.value === 'number' ? value.value : 1;
    }

    return {
        value: result,
        toString: function() {
            return this.value.toString();
        },
        // used for sorting
        toNumber: function() {
            return this.value;
        }
    };
}

// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(params: IAggFuncParams): any {
    const { values } = params;
    let sum = 0;
    let count = 0;

    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (typeof value === 'number') {
            sum += value;
            count++;
        } else if (value != null && typeof value.value === 'number' && typeof value.count === 'number') {
            // we are aggregating groups, so we take the aggregated values to calculated a weighted average
            sum += value.value * value.count;
            count += value.count;
        }
    }

    // avoid divide by zero error
    const value = count > 0 ? sum / count : null;

    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    return {
        count,
        value,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function() {
            return typeof this.value === 'number' ? this.value.toString() : '';
        },
        // used for sorting
        toNumber: function() {
            return this.value;
        }
    };
}
