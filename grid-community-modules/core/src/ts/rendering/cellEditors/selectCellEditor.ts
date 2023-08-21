import { AgSelect } from "../../widgets/agSelect";
import { Autowired } from "../../context/context";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { ValueFormatterService } from "../valueFormatterService";
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { ListOption } from "../../widgets/agList";
import { missing } from "../../utils/generic";
import { KeyCode } from '../../constants/keyCode';

export interface ISelectCellEditorParams<TValue = any> {
    /** List of values to display */
    values: TValue[];
    /** The space in pixels between the value display and the list of items. Default: `4` */
    valueListGap?: number;
}

interface SelectCellEditorParams<TData = any, TValue = any, TContext = any> extends ISelectCellEditorParams<TValue>, ICellEditorParams<TData, TValue, TContext> {}

export class SelectCellEditor extends PopupComponent implements ICellEditorComp {

    private focusAfterAttached: boolean;

    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @RefSelector('eSelect') private eSelect: AgSelect;

    private startedByEnter: boolean = false;

    constructor() {
        super(/* html */
            `<div class="ag-cell-edit-wrapper">
                <ag-select class="ag-cell-editor" ref="eSelect"></ag-select>
            </div>`
        );
    }

    public init(params: SelectCellEditorParams): void {
        this.focusAfterAttached = params.cellStartedEdit;

        const { values, value, eventKey } = params;
        if (missing(values)) {
            console.warn('AG Grid: no values found for select cellEditor');
            return;
        }

        this.startedByEnter = eventKey != null ? eventKey === KeyCode.ENTER : false;

        let hasValue = false;
        values.forEach((currentValue: any) => {
            const option: ListOption = { value: currentValue };
            const valueFormatted = this.valueFormatterService.formatValue(params.column, null, currentValue);
            const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : currentValue;

            this.eSelect.addOption(option);
            hasValue = hasValue || value === currentValue;
        });

        if (hasValue) {
            this.eSelect.setValue(params.value, true);
        } else if (params.values.length) {
            this.eSelect.setValue(params.values[0], true);
        }

        if (params.valueListGap != null) {
            this.eSelect.setPickerGap(params.valueListGap);
        }

        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (this.gridOptionsService.get('editType') !== 'fullRow') {
            this.addManagedListener(this.eSelect, AgSelect.EVENT_ITEM_SELECTED, () => params.stopEditing());
        }
    }

    public afterGuiAttached() {
        if (this.focusAfterAttached) {
            this.eSelect.getFocusableElement().focus();
        }

        if (this.startedByEnter) {
            setTimeout(() => {
                if (this.isAlive()) {
                    this.eSelect.showPicker();
                }
            });
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