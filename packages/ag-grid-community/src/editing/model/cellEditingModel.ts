export class CellEditingModel {
    public rowId: string;
    public columnId: string;

    oldValue: any;
    newValue: any;

    constructor(rowId: string, columnId: string) {
        this.rowId = rowId;
        this.columnId = columnId;
    }

    setValues(oldValue: any, newValue: any) {
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}
