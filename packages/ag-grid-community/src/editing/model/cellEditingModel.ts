export class CellEditingModel {
    public columnId: string;

    public oldValue: any;
    public newValue: any;

    constructor(columnId: string) {
        this.columnId = columnId;
    }

    setValues(oldValue: any, newValue: any) {
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}
