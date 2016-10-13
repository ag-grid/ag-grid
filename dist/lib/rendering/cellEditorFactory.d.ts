// Type definitions for ag-grid v6.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ICellEditor, ICellEditorParams } from "./cellEditors/iCellEditor";
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
        new (): ICellEditor;
    }): void;
    createCellEditor(key: string | {
        new (): ICellEditor;
    }, params: ICellEditorParams): ICellEditor;
}
