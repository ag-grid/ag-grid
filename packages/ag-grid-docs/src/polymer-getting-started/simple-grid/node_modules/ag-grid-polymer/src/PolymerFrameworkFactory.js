export default class PolymerFrameworkFactory {
    constructor(baseFrameworkFactory, componentFactory) {
        this._baseFrameworkFactory = baseFrameworkFactory;
        this._componentFactory = componentFactory;
    }

    colDefCellEditor(colDef) {
        if (colDef.cellEditorFramework && colDef.cellEditorFramework.component) {
            console.warn("colDef.cellEditorFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.cellEditorFramework = colDef.cellEditorFramework.component;
        }

        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework)
        } else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    colDefFilter(colDef) {
        if (colDef.filterFramework && colDef.filterFramework.component) {
            console.warn("colDef.filterFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.filterFramework = colDef.filterFramework.component;
        }

        if (colDef.filterFramework) {
            return this._componentFactory.createFilterFromComponent(colDef.filterFramework)
        } else {

            return this._baseFrameworkFactory.colDefFilter(colDef);
        }
    }

    setTimeout(action, timeout) {
        this._baseFrameworkFactory.setTimeout(action, timeout);
    }
}
