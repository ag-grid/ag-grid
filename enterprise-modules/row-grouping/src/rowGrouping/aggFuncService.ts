import {
    Autowired,
    Bean,
    Column,
    GridOptionsWrapper,
    IAggFunc,
    IAggFuncService,
    PostConstruct,
    _
} from "@ag-grid-community/core";

@Bean('aggFuncService')
export class AggFuncService implements IAggFuncService {

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
        } else {
            return _.existsAndNotEmpty(allKeys) ? allKeys[0] : null;
        }
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
    return input
        .filter(value => typeof value === 'number')
        .reduce((sum, value) => sum === null ? value : sum + value, null);
}

function aggFirst(input: any[]): any {
    return input.length > 0 ? input[0] : null;
}

function aggLast(input: any[]): any {
    return input.length > 0 ? _.last(input) : null;
}

function aggMin(input: any[]): any {
    return input
        .filter(value => typeof value === 'number')
        .reduce((min, value) => min === null || value < min ? value : min, null);
}

function aggMax(input: any[]): any {
    return input
        .filter(value => typeof value === 'number')
        .reduce((max, value) => max === null || value > max ? value : max, null);
}

function aggCount(input: any[]): any {
    const value = input.reduce((count, item) => {
        const isGroupAgg = _.exists(item) && typeof item.value === 'number';

        return count + (isGroupAgg ? item.value : 1);
    }, 0);

    return {
        value,
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
function aggAvg(input: any[]): any {
    // the average will be the sum / count
    const { sum, count } = input.reduce(({ sum, count }, item) => {
        const itemIsGroupResult = _.exists(item) &&
            typeof item.value === 'number' &&
            typeof item.count === 'number';

        if (typeof item === 'number') {
            return { sum: sum + item, count: count + 1 };
        }

        if (itemIsGroupResult) {
            // we are aggregating groups, so we take the
            // aggregated values to calculated a weighted average
            return {
                sum: sum + item.value * item.count,
                count: count + item.count
            };
        }

        return { sum, count };
    }, { sum: 0, count: 0 });

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
}
