import {AbstractColDef} from "./colDef";

// Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
export interface ColumnGroupChild {
    getActualWidth(): number;
    getMinWidth(): number;
    getDefinition(): AbstractColDef;
    getColumnGroupShow(): string;
}
