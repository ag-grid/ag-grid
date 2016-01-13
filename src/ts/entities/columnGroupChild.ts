module ag.grid {

    export interface ColumnGroupChild {
        getActualWidth(): number;
        getMinimumWidth(): number;
        getDefinition(): AbstractColDef;
        getColId(): string;
    }

}