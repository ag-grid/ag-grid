// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellEditorComp, ICellEditorParams } from "./cellEditors/iCellEditor";
import { ColDef } from "../entities/colDef";
import { Promise } from "../utils";
export declare class CellEditorFactory {
    private context;
    private componentResolver;
    private gridOptionsWrapper;
    private init();
    addCellEditor(key: string, cellEditor: {
        new (): ICellEditorComp;
    }): void;
    createCellEditor(column: ColDef, params: ICellEditorParams): Promise<ICellEditorComp>;
}
