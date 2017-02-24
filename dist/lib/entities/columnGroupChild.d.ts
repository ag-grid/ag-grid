// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { AbstractColDef } from "./colDef";
import { IEventEmitter } from "../interfaces/iEventEmitter";
export interface ColumnGroupChild extends IEventEmitter {
    getUniqueId(): string;
    getActualWidth(): number;
    getMinWidth(): number;
    getLeft(): number;
    getOldLeft(): number;
    getDefinition(): AbstractColDef;
    getColumnGroupShow(): string;
    getParent(): ColumnGroupChild;
    setParent(parent: ColumnGroupChild): void;
}
