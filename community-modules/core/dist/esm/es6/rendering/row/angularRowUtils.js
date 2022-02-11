/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
export class AngularRowUtils {
    static createChildScopeOrNull(rowNode, parentScope, gridOptionsWrapper) {
        const isAngularCompileRows = gridOptionsWrapper.isAngularCompileRows();
        if (!isAngularCompileRows) {
            return null;
        }
        const newChildScope = parentScope.$new();
        newChildScope.data = Object.assign({}, rowNode.data);
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
