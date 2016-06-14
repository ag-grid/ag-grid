import {
    IAggregationFunctionService, IAggFunction, Bean
} from "ag-grid/main";

@Bean('aggregationFunctionService')
export class AggregationFunctionService implements IAggregationFunctionService {

    private aggFunctionsMap: {[key: string]: IAggFunction} = {};

    constructor() {
        this.initialiseWithDefaultAggregations();
    }

    private initialiseWithDefaultAggregations(): void {
        this.aggFunctionsMap['sum'] = aggSum;
        this.aggFunctionsMap['first'] = aggFirst;
        this.aggFunctionsMap['last'] = aggLast;
        this.aggFunctionsMap['min'] = aggMin;
        this.aggFunctionsMap['max'] = aggMax;
    }

    public getAggFunction(name: string): IAggFunction {
        return this.aggFunctionsMap[name];
    }
}

function aggSum(input: any[]): any {
    var result: number = null;
    var length = input.length;
    for (var i = 0; i<length; i++) {
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
    if (input.length>=0) {
        return input[0];
    } else {
        return null;
    }
}

function aggLast(input: any[]): any {
    if (input.length>=0) {
        return input[input.length-1];
    } else {
        return null;
    }
}

function aggMin(input: any[]): any {
    var result: number = null;
    var length = input.length;
    for (var i = 0; i<length; i++) {
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
    var result: number = null;
    var length = input.length;
    for (var i = 0; i<length; i++) {
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