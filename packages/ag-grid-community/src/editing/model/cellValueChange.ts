export class CellValueChange {
    public rowId: string;
    public columnId: string;
    public oldValue: any;
    public newValue: any;

    constructor(rowId: string, columnId: string, oldValue: any, newValue: any) {
        this.rowId = rowId;
        this.columnId = columnId;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}
