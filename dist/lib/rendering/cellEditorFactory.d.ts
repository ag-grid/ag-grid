// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ICellEditor } from "./cellEditors/iCellEditor";
export declare class CellEditorFactory {
    private static TEXT;
    private static SELECT;
    private static POPUP_TEXT;
    private static POPUP_SELECT;
    private context;
    private gridOptionsWrapper;
    private cellEditorMap;
    private init();
    addCellEditor(key: string, cellEditor: {
        new (): ICellEditor;
    }): void;
    createCellEditor(key: string | {
        new (): ICellEditor;
    }): ICellEditor;
}
