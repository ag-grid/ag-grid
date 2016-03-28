import {Component, ICellEditor} from 'ag-grid/main';

export class PopupListCellEditor extends Component implements ICellEditor {

    constructor() {
        super('<div class="ag-popup-editor"><input/></div>');
    }

    public init(params: any): void {
        var eInput = <HTMLInputElement> this.getGui().querySelector('input');
        eInput.value = params.value;
    }
    
    public afterGuiAttached(): void {
        var eInput = <HTMLInputElement> this.getGui().querySelector('input');
        eInput.focus();
        eInput.select();
    }
    
    public getValue(): any {
        var eInput = <HTMLInputElement> this.getGui().querySelector('input');
        return eInput.value;
    }
    
    public isPopup(): boolean {
        return true;
    }

}
