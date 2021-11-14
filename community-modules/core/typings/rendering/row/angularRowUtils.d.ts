import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
export declare class AngularRowUtils {
    static createChildScopeOrNull(rowNode: RowNode, parentScope: any, gridOptionsWrapper: GridOptionsWrapper): {
        scope: any;
        scopeDestroyFunc: () => void;
    } | null;
}
