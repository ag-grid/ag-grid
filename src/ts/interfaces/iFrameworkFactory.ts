
import {ColDef} from "../entities/colDef";
import {ICellRenderer, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";
import {ICellEditor} from "../rendering/cellEditors/iCellEditor";
import {IFilter, IFilterComp} from "./iFilter";
import {GridOptions} from "../entities/gridOptions";
import {IDateComponent} from "../rendering/dateComponent";

export interface IFrameworkFactory {

    colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string;

    colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string;

    colDefCellEditor(colDef: ColDef): {new(): ICellEditor} | string;

    colDefFilter(colDef: ColDef): {new(): IFilterComp} | string;

    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string;

    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string;

    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string;

    dateComponent (gridOptions: GridOptions): {new(): IDateComponent};

    /** Because Angular 2 uses Zones, you should not use setTimout(). So to get around this, we allow the framework
     * to specify how to execute setTimeout. The default is to just call the browser setTimeout(). */
    setTimeout(action: any, timeout?: any): void;
}