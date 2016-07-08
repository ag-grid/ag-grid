import {Component} from "../../widgets/component";
import {ICellEditor} from "./iCellEditor";
import {Utils as _} from '../../utils';

export class SelectCellEditor extends Component implements ICellEditor {

    constructor() {
        super('<div class="ag-cell-edit-input"><select class="ag-cell-edit-input"/></div>');
    }

    public init(params: any) {
        var eSelect = <HTMLSelectElement>this.getGui().querySelector('select');
        if (_.missing(params.values)) {
            console.log('ag-Grid: no values found for select cellEditor');
            return;
        }

        if (this.isInternetExplorer()) {
            this.addDestroyableEventListener(eSelect, 'mousedown', (event) => { event.stopPropagation(); });
        }

        params.values.forEach((value: any) => {
            var option = document.createElement('option');
            if (params.valueField && params.textField) {
                option.value = value[params.valueField];
                option.text = value[params.textField];
            } else {
                option.value = value;
                option.text = value;
            }
            if (params.value === value) {
                option.selected = true;
            }
            eSelect.appendChild(option);
        });

        this.addDestroyableEventListener(eSelect, 'change', () => params.stopEditing());
    }

    public afterGuiAttached() {
        var eSelect = <HTMLSelectElement>this.getGui().querySelector('select');
        eSelect.focus();
    }

    public getValue(): any {
        var eSelect = <HTMLSelectElement>this.getGui().querySelector('select');
        return eSelect.value;
    }

    private isInternetExplorer() {
        var userAgent: string = window.navigator.userAgent;
        return userAgent.indexOf("MSIE ") > 0 || !!userAgent.match(/Trident.*rv\:11\./);
    }
}
