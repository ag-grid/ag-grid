import {IAggFunc} from "../entities/colDef";
export interface IAggFuncService {

    addAggFuncs(aggFuncs: {[key: string]: IAggFunc}): void;
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    clear(): void;
    getDefaultAggFunc(): string;
}
