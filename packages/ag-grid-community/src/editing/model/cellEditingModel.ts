import { CellValueChange } from './cellValueChange';

export class CellEditingModel {
    public rowId: string;
    public columnId: string;

    private _oldValue: any;
    public set oldValue(value: any) {
        this._oldValue = value;
    }
    public get oldValue(): any {
        return this._oldValue;
    }

    private _newValue: any;
    public set newValue(value: any) {
        this._newValue = value;
        const event = new CellValueChange(this.rowId, this.columnId, this.oldValue, value);

        if (this.oldValue === value) {
            this.onUpdateFailure?.(event);
            return;
        }

        this.onUpdateSuccess?.(event);
    }
    public get newValue(): any {
        return this._newValue;
    }

    constructor(rowId: string, columnId: string) {
        this.rowId = rowId;
        this.columnId = columnId;
    }

    public onUpdateSuccess: (event: CellValueChange) => void;
    public onUpdateFailure: (event: CellValueChange) => void;
}
