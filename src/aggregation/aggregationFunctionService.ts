import {
    IAggFuncService, IAggFunc, Bean, Utils, PostConstruct, Autowired, GridOptionsWrapper
} from "ag-grid/main";

@Bean('aggFuncService')
export class AggFuncService implements IAggFuncService {

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    private aggFuncsMap: {[key: string]: IAggFunc} = {};

    @PostConstruct
    private init() {
        this.initialiseWithDefaultAggregations();
        this.addAggFuncs(this.gridOptionsWrapper.getAggFuncs());
    }

    private initialiseWithDefaultAggregations(): void {
        this.aggFuncsMap['sum'] = aggSum;
        this.aggFuncsMap['first'] = aggFirst;
        this.aggFuncsMap['last'] = aggLast;
        this.aggFuncsMap['min'] = aggMin;
        this.aggFuncsMap['max'] = aggMax;
    }

    public addAggFuncs(aggFuncs: {[key: string]: IAggFunc}): void {
        Utils.iterateObject(aggFuncs, this.addAggFunc.bind(this));
    }

    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        this.aggFuncsMap[key] = aggFunc;
    }

    public getAggFunc(name: string): IAggFunc {
        return this.aggFuncsMap[name];
    }

    public clear(): void {
        this.aggFuncsMap = {};
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