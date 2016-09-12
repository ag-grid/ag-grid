import {BaseFrameworkFactory, ColDef, ICellRenderer, ICellRendererFunc, Utils, GridOptions, ICellEditor} from 'ag-grid';
import {reactCellRendererFactory} from "../lib/reactCellRendererFactory";
import {reactCellEditorFactory} from "./reactCellEditorFactory";

export class ReactFrameworkFactory extends BaseFrameworkFactory {

    private agGridReact: any;

    constructor(agGridReact: any) {
        super();
        this.agGridReact = agGridReact;
    }

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(colDef.floatingCellRendererFmk)) {
            return reactCellRendererFactory(colDef.floatingCellRendererFmk, this.agGridReact);
        } else {
            return super.colDefFloatingCellRenderer(colDef);
        }
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(colDef.cellRendererFmk)) {
            return reactCellRendererFactory(colDef.cellRendererFmk, this.agGridReact);
        } else {
            return super.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditor} | string {
        if (Utils.exists(colDef.cellEditorFmk)) {
            return reactCellEditorFactory(colDef.cellEditorFmk, this.agGridReact);
        } else {
            return super.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(gridOptions.fullWidthCellRendererFmk)) {
            return reactCellRendererFactory(gridOptions.fullWidthCellRendererFmk, this.agGridReact);
        } else {
            return super.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(gridOptions.groupRowRendererFmk)) {
            return reactCellRendererFactory(gridOptions.groupRowRendererFmk, this.agGridReact);
        } else {
            return super.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (Utils.exists(gridOptions.groupRowInnerRendererFmk)) {
            return reactCellRendererFactory(gridOptions.groupRowInnerRendererFmk, this.agGridReact);
        } else {
            return super.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

}