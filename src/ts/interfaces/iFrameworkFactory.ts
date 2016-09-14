
import {ColDef} from "../entities/colDef";
import {ICellRenderer, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";
import {ICellEditor} from "../rendering/cellEditors/iCellEditor";
import {IFilter} from "./iFilter";
import {GridOptions} from "../entities/gridOptions";

export interface IFrameworkFactory {

    colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string;

    colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string;

    colDefCellEditor(colDef: ColDef): {new(): ICellEditor} | string;

    colDefFilter(colDef: ColDef): {new(): IFilter} | string;

    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string;

    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string;

    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string;

}