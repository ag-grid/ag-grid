import {BaseFrameworkFactory, ColDef, GridOptions} from 'ag-grid-community';
import {VueComponentFactory} from './VueComponentFactory';

export class VueFrameworkFactory {
    private baseFrameworkFactory: BaseFrameworkFactory;
    private componentFactory: VueComponentFactory;

    constructor($el: HTMLElement, parent: any) {
        this.baseFrameworkFactory = new BaseFrameworkFactory();
        this.componentFactory = new VueComponentFactory($el, parent);
    }

    // spl floatingCellRendererFramework removed? confirm and if so remove this
    public colDefFloatingCellRenderer(colDef: any): any {
        if (colDef.floatingCellRendererFramework) {
            return this.componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework);
        } else {
            return this.baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    }

    public colDefCellRenderer(colDef: ColDef): any {
        if (colDef.cellRendererFramework) {
            return this.componentFactory.createRendererFromComponent(colDef.cellRendererFramework);
        } else {
            return this.baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef: ColDef): any {
        if (colDef.cellEditorFramework) {
            return this.componentFactory.createEditorFromComponent(colDef.cellEditorFramework);
        } else {
            return this.baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): any {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this.componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework);
        } else {
            return this.baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): any {
        if (gridOptions.groupRowRendererFramework) {
            return this.componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework);
        } else {
            return this.baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): any {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this.componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework);
        } else {
            return this.baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

    public colDefFilter(colDef: ColDef): any {
        if (colDef.filterFramework) {
            return this.componentFactory.createFilterFromComponent(colDef.filterFramework);
        } else {

            return this.baseFrameworkFactory.colDefFilter(colDef);
        }
    }

    public setTimeout(action: any, timeout: any) {
        this.baseFrameworkFactory.setTimeout(action, timeout);
    }
}
