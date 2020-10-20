import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";

export class AngularRowUtils {

    public static createChildScopeOrNull(rowNode: RowNode, parentScope: any, gridOptionsWrapper: GridOptionsWrapper): {scope: any, scopeDestroyFunc: () => void} | null {

        const isAngularCompileRows = gridOptionsWrapper.isAngularCompileRows();

        if (!isAngularCompileRows) { return null; }

        const newChildScope = parentScope.$new();
        newChildScope.data = { ...rowNode.data };
        newChildScope.rowNode = rowNode;
        newChildScope.context = gridOptionsWrapper.getContext();

        const destroyFunc = () => {
            newChildScope.$destroy();
            newChildScope.data = null;
            newChildScope.rowNode = null;
            newChildScope.context = null;
        };

        return {
            scope: newChildScope,
            scopeDestroyFunc: destroyFunc
        };
    }

}