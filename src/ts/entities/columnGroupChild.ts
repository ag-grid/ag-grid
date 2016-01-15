module ag.grid {

    // Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
    // See the note at the top of Column class.
    export interface ColumnGroupChild {
        getActualWidth(): number;
        getMinimumWidth(): number;
        getDefinition(): AbstractColDef;
        getColumnGroupShow(): string;
    }
}