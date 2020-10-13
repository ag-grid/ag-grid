import {RowNode} from "../entities/rowNode";

export interface ServerSideTransaction {
    route?: string[];
    addIndex?: number;
    add?: any[];
    remove?: any[];
    update?: any[];
}

export interface ServerSideTransactionResult {
    routeFound: boolean;
    applied: boolean;
    add?: RowNode[];
    remove?: RowNode[];
    update?: RowNode[];
}
