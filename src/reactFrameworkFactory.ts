import {BaseFrameworkFactory, IFrameworkFactory, IFilter, ColDef, ICellRenderer, ICellRendererFunc, Utils, GridOptions, ICellEditor} from 'ag-grid';
import {reactCellRendererFactory} from "../lib/reactCellRendererFactory";
import {reactCellEditorFactory} from "./reactCellEditorFactory";
import {reactFilterFactory} from "./reactFilterFactory";

export class ReactFrameworkFactory implements IFrameworkFactory {

    private agGridReact: any;
    private baseFrameworkFactory = new BaseFrameworkFactory();

    constructor(agGridReact: any) {
        this.agGridReact = agGridReact;
    }

    public colDefFilter(colDef: ColDef): {new(): IFilter} | string {
        if (Utils.exists(colDef.filterFramework)) {
            return reactFilterFactory(colDef.filterFramework, this.agGridReact);
        } else {
            return this.baseFrameworkFactory.colDefFilter(colDef);
        }
    }

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(colDef.floatingCellRendererFramework)) {
            return reactCellRendererFactory(colDef.floatingCellRendererFramework, this.agGridReact);
        } else {
            return this.baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(colDef.cellRendererFramework)) {
            return reactCellRendererFactory(colDef.cellRendererFramework, this.agGridReact);
        } else {
            return this.baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditor} | string {
        if (Utils.exists(colDef.cellEditorFramework)) {
            return reactCellEditorFactory(colDef.cellEditorFramework, this.agGridReact);
        } else {
            return this.baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(gridOptions.fullWidthCellRendererFramework)) {
            return reactCellRendererFactory(gridOptions.fullWidthCellRendererFramework, this.agGridReact);
        } else {
            return this.baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(gridOptions.groupRowRendererFramework)) {
            return reactCellRendererFactory(gridOptions.groupRowRendererFramework, this.agGridReact);
        } else {
            return this.baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(gridOptions.groupRowInnerRendererFramework)) {
            return reactCellRendererFactory(gridOptions.groupRowInnerRendererFramework, this.agGridReact);
        } else {
            return this.baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

}