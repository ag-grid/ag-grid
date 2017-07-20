class PolymerFrameworkFactory {
    constructor(baseFrameworkFactory, componentFactory) {
        this._baseFrameworkFactory = baseFrameworkFactory;
        this._componentFactory = componentFactory;
    }

    colDefFloatingCellRenderer(colDef) {
        if (colDef.pinnedRowCellRendererFramework && colDef.pinnedRowCellRendererFramework.component) {
            console.warn("colDef.pinnedRowCellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.pinnedRowCellRendererFramework = colDef.pinnedRowCellRendererFramework.component;
        }

        if (colDef.pinnedRowCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.pinnedRowCellRendererFramework)
        } else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    }

    colDefCellRenderer(colDef) {
        if (colDef.cellRendererFramework && colDef.cellRendererFramework.component) {
            console.warn("colDef.cellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.cellRendererFramework = colDef.cellRendererFramework.component;
        }

        if (colDef.cellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework)
        } else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
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

    gridOptionsFullWidthCellRenderer(gridOptions) {
        if (gridOptions.fullWidthCellRendererFramework && gridOptions.fullWidthCellRendererFramework.component) {
            console.warn("gridOptions.fullWidthCellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.fullWidthCellRendererFramework = gridOptions.fullWidthCellRendererFramework.component;
        }

        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    gridOptionsGroupRowRenderer(gridOptions) {
        if (gridOptions.groupRowRendererFramework && gridOptions.groupRowRendererFramework.component) {
            console.warn("gridOptions.groupRowRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.groupRowRendererFramework = gridOptions.groupRowRendererFramework.component;
        }

        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    gridOptionsGroupRowInnerRenderer(gridOptions) {
        if (gridOptions.groupRowInnerRendererFramework && gridOptions.groupRowInnerRendererFramework.component) {
            console.warn("gridOptions.groupRowRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.groupRowInnerRendererFramework = gridOptions.groupRowInnerRendererFramework.component;
        }

        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
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