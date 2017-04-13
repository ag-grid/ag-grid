// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellEditorComp, ICellEditorParams } from "./cellEditors/iCellEditor";
export declare class CellEditorFactory {
    private static TEXT;
    private static SELECT;
    private static POPUP_TEXT;
    private static POPUP_SELECT;
    private static LARGE_TEXT;
    private context;
    private gridOptionsWrapper;
    private cellEditorMap;
    private init();
    addCellEditor(key: string, cellEditor: {
        new (): ICellEditorComp;
    }): void;
    createCellEditor(key: string | {
        new (): ICellEditorComp;
    }, params: ICellEditorParams): ICellEditorComp;
}
