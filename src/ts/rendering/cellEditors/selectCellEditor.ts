import {Component} from "../../widgets/component";
import {ICellEditorComp} from "./iCellEditor";
import {Utils as _} from '../../utils';
import {Constants} from "../../constants";
import {Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ValueFormatterService} from "../valueFormatterService";

export class SelectCellEditor extends Component implements ICellEditorComp {

    private focusAfterAttached: boolean;
    private eSelect: HTMLSelectElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

    constructor() {
        super('<div class="ag-cell-edit-input"><select class="ag-cell-edit-input"/></div>');
        this.eSelect = <HTMLSelectElement> this.getGui().querySelector('select');
    }

    public init(params: any) {
        this.focusAfterAttached = params.cellStartedEdit;

        if (_.missing(params.values)) {
            console.log('ag-Grid: no values found for select cellEditor');
            return;
        }

        params.values.forEach( (value: any)=> {
            let option = document.createElement('option');
            option.value = value;

            let valueFormatted = this.valueFormatterService.formatValue(params.column, null, null, value);
            let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;

            if (params.value === value) {
                option.selected = true;
            }
            this.eSelect.appendChild(option);
        });

        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            this.addDestroyableEventListener(this.eSelect, 'change', ()=> params.stopEditing() );
        }

        this.addDestroyableEventListener(this.eSelect, 'keydown', (event: KeyboardEvent)=> {
            let isNavigationKey = event.keyCode===Constants.KEY_UP || event.keyCode===Constants.KEY_DOWN;
            if (isNavigationKey) {
                event.stopPropagation();
            }
        });

        this.addDestroyableEventListener(this.eSelect, 'mousedown', (event: KeyboardEvent)=> {
            event.stopPropagation();
        });
    }

    public afterGuiAttached() {
        if (this.focusAfterAttached) {
            this.eSelect.focus();
        }
    }

    public focusIn(): void {
        this.eSelect.focus();
    }

    public getValue(): any {
        return this.eSelect.value;
    }
}