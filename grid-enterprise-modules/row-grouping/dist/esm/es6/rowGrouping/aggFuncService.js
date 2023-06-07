var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AggFuncService_1;
import { Bean, BeanStub, PostConstruct, _ } from '@ag-grid-community/core';
// @ts-ignore
const AGBigInt = typeof BigInt === 'undefined' ? null : BigInt;
let AggFuncService = AggFuncService_1 = class AggFuncService extends BeanStub {
    constructor() {
        super(...arguments);
        this.aggFuncsMap = {};
        this.initialised = false;
    }
    init() {
        if (this.initialised) {
            return;
        }
        this.initialiseWithDefaultAggregations();
        this.addAggFuncs(this.gridOptionsService.get('aggFuncs'));
    }
    initialiseWithDefaultAggregations() {
        this.aggFuncsMap[AggFuncService_1.AGG_SUM] = aggSum;
        this.aggFuncsMap[AggFuncService_1.AGG_FIRST] = aggFirst;
        this.aggFuncsMap[AggFuncService_1.AGG_LAST] = aggLast;
        this.aggFuncsMap[AggFuncService_1.AGG_MIN] = aggMin;
        this.aggFuncsMap[AggFuncService_1.AGG_MAX] = aggMax;
        this.aggFuncsMap[AggFuncService_1.AGG_COUNT] = aggCount;
        this.aggFuncsMap[AggFuncService_1.AGG_AVG] = aggAvg;
        this.initialised = true;
    }
    isAggFuncPossible(column, func) {
        const allKeys = this.getFuncNames(column);
        const allowed = _.includes(allKeys, func);
        const funcExists = _.exists(this.aggFuncsMap[func]);
        return allowed && funcExists;
    }
    getDefaultAggFunc(column) {
        const defaultAgg = column.getColDef().defaultAggFunc;
        if (_.exists(defaultAgg) && this.isAggFuncPossible(column, defaultAgg)) {
            return defaultAgg;
        }
        if (this.isAggFuncPossible(column, AggFuncService_1.AGG_SUM)) {
            return AggFuncService_1.AGG_SUM;
        }
        const allKeys = this.getFuncNames(column);
        return _.existsAndNotEmpty(allKeys) ? allKeys[0] : null;
    }
    addAggFuncs(aggFuncs) {
        _.iterateObject(aggFuncs, this.addAggFunc.bind(this));
    }
    addAggFunc(key, aggFunc) {
        this.init();
        this.aggFuncsMap[key] = aggFunc;
    }
    getAggFunc(name) {
        this.init();
        return this.aggFuncsMap[name];
    }
    getFuncNames(column) {
        const userAllowedFuncs = column.getColDef().allowedAggFuncs;
        return userAllowedFuncs == null ? Object.keys(this.aggFuncsMap).sort() : userAllowedFuncs;
    }
    clear() {
        this.aggFuncsMap = {};
    }
};
AggFuncService.AGG_SUM = 'sum';
AggFuncService.AGG_FIRST = 'first';
AggFuncService.AGG_LAST = 'last';
AggFuncService.AGG_MIN = 'min';
AggFuncService.AGG_MAX = 'max';
AggFuncService.AGG_COUNT = 'count';
AggFuncService.AGG_AVG = 'avg';
__decorate([
    PostConstruct
], AggFuncService.prototype, "init", null);
AggFuncService = AggFuncService_1 = __decorate([
    Bean('aggFuncService')
], AggFuncService);
export { AggFuncService };
function aggSum(params) {
    const { values } = params;
    let result = null; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value === 'number') {
            if (result === null) {
                result = value;
            }
            else {
                if (AGBigInt) {
                    result += typeof result === 'number' ? value : AGBigInt(value);
                }
                else {
                    result += value;
                }
            }
        }
        else if (typeof value === 'bigint') {
            if (result === null) {
                result = value;
            }
            else {
                result = (typeof result === 'bigint' ? result : AGBigInt(result)) + value;
            }
        }
    }
    return result;
}
function aggFirst(params) {
    return params.values.length > 0 ? params.values[0] : null;
}
function aggLast(params) {
    return params.values.length > 0 ? _.last(params.values) : null;
}
function aggMin(params) {
    const { values } = params;
    let result = null;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if ((typeof value === 'number' || typeof value === 'bigint') && (result === null || result > value)) {
            result = value;
        }
    }
    return result;
}
function aggMax(params) {
    const { values } = params;
    let result = null;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if ((typeof value === 'number' || typeof value === 'bigint') && (result === null || result < value)) {
            result = value;
        }
    }
    return result;
}
function aggCount(params) {
    const { values } = params;
    let result = 0;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        // check if the value is from a group, in which case use the group's count
        result += value != null && typeof value.value === 'number' ? value.value : 1;
    }
    return result;
}
// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(params) {
    var _a, _b, _c;
    const { values } = params;
    let sum = 0; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please
    let count = 0;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const currentValue = values[i];
        let valueToAdd = null;
        if (typeof currentValue === 'number' || typeof currentValue === 'bigint') {
            valueToAdd = currentValue;
            count++;
        }
        else if (currentValue != null && (typeof currentValue.value === 'number' || typeof currentValue.value === 'bigint') && typeof currentValue.count === 'number') {
            // we are aggregating groups, so we take the aggregated values to calculated a weighted average
            if (AGBigInt) {
                valueToAdd = currentValue.value * (typeof currentValue.value === 'number' ? currentValue.count : AGBigInt(currentValue.count));
            }
            else {
                valueToAdd = currentValue.value * currentValue.count;
            }
            count += currentValue.count;
        }
        if (typeof valueToAdd === 'number') {
            if (AGBigInt) {
                sum += typeof sum === 'number' ? valueToAdd : AGBigInt(valueToAdd);
            }
            else {
                sum += valueToAdd;
            }
        }
        else if (typeof valueToAdd === 'bigint') {
            sum = (typeof sum === 'bigint' ? sum : AGBigInt(sum)) + valueToAdd;
        }
    }
    let value = null;
    // avoid divide by zero error
    if (count > 0) {
        if (AGBigInt) {
            value = sum / (typeof sum === 'number' ? count : AGBigInt(count));
        }
        else {
            value = sum / count;
        }
    }
    // the previous aggregation data
    const existingAggData = (_b = (_a = params.rowNode) === null || _a === void 0 ? void 0 : _a.aggData) === null || _b === void 0 ? void 0 : _b[(_c = params.column) === null || _c === void 0 ? void 0 : _c.getColId()];
    if (existingAggData && existingAggData.count === count && existingAggData.value === value) {
        // the underlying values haven't changed, return the old object to avoid triggering change detection
        return existingAggData;
    }
    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    return {
        count,
        value,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function () {
            return typeof this.value === 'number' || typeof this.value === 'bigint' ? this.value.toString() : '';
        },
        // used for sorting
        toNumber: function () {
            return this.value;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdnRnVuY1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcm93R3JvdXBpbmcvYWdnRnVuY1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLE9BQU8sRUFDSCxJQUFJLEVBQ0osUUFBUSxFQUlSLGFBQWEsRUFDYixDQUFDLEVBRUosTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxhQUFhO0FBQ2IsTUFBTSxRQUFRLEdBQUcsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUcvRCxJQUFhLGNBQWMsc0JBQTNCLE1BQWEsY0FBZSxTQUFRLFFBQVE7SUFBNUM7O1FBVVksZ0JBQVcsR0FBaUMsRUFBRSxDQUFDO1FBQy9DLGdCQUFXLEdBQUcsS0FBSyxDQUFDO0lBb0VoQyxDQUFDO0lBakVXLElBQUk7UUFDUixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLGlDQUFpQyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLGlDQUFpQztRQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWMs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