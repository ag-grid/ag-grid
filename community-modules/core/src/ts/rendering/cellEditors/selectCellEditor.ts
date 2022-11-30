import { AgSelect } from "../../widgets/agSelect";
import { Autowired } from "../../context/context";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { ValueFormatterService } from "../valueFormatterService";
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { ListOption } from "../../widgets/agList";
import { missing } from "../../utils/generic";
import { KeyCode } from '../../constants/keyCode';

export interface ISelectCellEditorParams extends ICellEditorParams {
    values: any[];
}

export class SelectCellEditor extends PopupComponent implements ICellEditorComp {

    private focusAfterAttached: boolean;

    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @RefSelector('eSelect') private eSelect: AgSelect;

    private startedByEnter: boolean = false;

    constructor() {
        super('<div class="ag-cell-edit-wrapper"><ag-select class="ag-cell-editor" ref="eSelect"></ag-select></div>');
    }

    public init(params: ISelectCellEditorParams): void {
        this.focusAfterAttached = params.cellStartedEdit;

        if (missing(params.values)) {
            console.warn('AG Grid: no values found for select cellEditor');
            return;
        }

        this.startedByEnter = params.eventKey != null ? params.eventKey === KeyCode.ENTER : false;

        let hasValue = false;
        params.values.forEach((value: any) => {
            const option: ListOption = { value };
            const valueFormatted = this.valueFormatterService.formatValue(params.column, null, value);
            const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;

            this.eSelect.addOption(option);
            hasValue = hasValue || params.value === value;
        });

        if (hasValue) {
            this.eSelect.setValue(params.value, true);
        } else if (params.values.length) {
            this.eSelect.setValue(params.values[0], true);
        }

        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (this.gridOptionsService.get('editType') !== 'fullRow') {
            this.eSelect.onValueChange(() => params.stopEditing());
        }
    }

    public afterGuiAttached() {
        if (this.focusAfterAttached) {
            this.eSelect.getFocusableElement().focus();
        }

        if (this.startedByEnter) {
            this.eSelect.showPicker();
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