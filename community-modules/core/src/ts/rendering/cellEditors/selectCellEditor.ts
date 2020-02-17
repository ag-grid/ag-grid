import { AgSelect } from "../../widgets/agSelect";
import { Autowired } from "../../context/context";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ValueFormatterService } from "../valueFormatterService";
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { ListOption } from "../../widgets/agList";
import { _ } from '../../utils';

export interface ISelectCellEditorParams extends ICellEditorParams {
    values: any[];
}

export class SelectCellEditor extends PopupComponent implements ICellEditorComp {

    private focusAfterAttached: boolean;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @RefSelector('eSelect') private eSelect: AgSelect;

    constructor() {
        super('<div class="ag-cell-edit"><ag-select class="ag-cell-edit-input" ref="eSelect"></ag-select></div>');
    }

    public init(params: ISelectCellEditorParams) {
        this.focusAfterAttached = params.cellStartedEdit;

        if (_.missing(params.values)) {
            console.warn('ag-Grid: no values found for select cellEditor');
            return;
        }

        params.values.forEach((value: any) => {
            const option: ListOption = { value };
            const valueFormatted = this.valueFormatterService.formatValue(params.column, null, null, value);
            const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;

            this.eSelect.addOption(option);
        });

        this.eSelect.setValue(params.value, true);

        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            this.eSelect.onValueChange(() => params.stopEditing());
        }
    }

    public afterGuiAttached() {
        if (this.focusAfterAttached) {
            this.eSelect.getFocusableElement().focus();
        }
    }

    public focusIn(): void {
        this.eSelect.getFocusableElement().focus();
    }

    public getValue(): any {
        return this.eSelect.getValue();
    }

    public isPopup() {
        return false;
    }
}