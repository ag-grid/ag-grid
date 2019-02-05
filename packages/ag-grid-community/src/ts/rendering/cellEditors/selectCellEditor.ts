import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { Constants } from "../../constants";
import { Autowired } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ValueFormatterService } from "../valueFormatterService";
import { _ } from '../../utils';

export interface ISelectCellEditorParams extends ICellEditorParams {
    values: any[];
}

export class SelectCellEditor extends PopupComponent implements ICellEditorComp {

    private focusAfterAttached: boolean;
    private eSelect: HTMLSelectElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

    constructor() {
        super('<div class="ag-cell-edit-input"><select class="ag-cell-edit-input"/></div>');
        this.eSelect = this.getGui().querySelector('select') as HTMLSelectElement;
    }

    public init(params: ISelectCellEditorParams) {
        this.focusAfterAttached = params.cellStartedEdit;

        if (_.missing(params.values)) {
            console.warn('ag-Grid: no values found for select cellEditor');
            return;
        }

        params.values.forEach((value: any) => {
            const option = document.createElement('option');
            option.value = value;

            const valueFormatted = this.valueFormatterService.formatValue(params.column, null, null, value);
            const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;

            if (params.value === value) {
                option.selected = true;
            }
            this.eSelect.appendChild(option);
        });

        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            this.addDestroyableEventListener(this.eSelect, 'change', () => params.stopEditing());
        }

        this.addDestroyableEventListener(this.eSelect, 'keydown', (event: KeyboardEvent) => {
            const isNavigationKey = event.keyCode === Constants.KEY_UP || event.keyCode === Constants.KEY_DOWN;
            if (isNavigationKey) {
                event.stopPropagation();
            }
        });

        this.addDestroyableEventListener(this.eSelect, 'mousedown', (event: KeyboardEvent) => {
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

    public isPopup() {
        return false;
    }
}