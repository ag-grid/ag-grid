import { AgSelect } from "../../widgets/agSelect";
import { Autowired } from "../../context/context";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { ListOption } from "../../widgets/agList";
import { missing } from "../../utils/generic";
import { KeyCode } from '../../constants/keyCode';
import { ValueService } from "../../valueService/valueService";

export interface ISelectCellEditorParams<TValue = any> {
    /** List of values to display */
    values: TValue[];
    /**
     * The space in pixels between the value display and the list of items.
     * @default 4
     */
    valueListGap?: number;
    /** The maximum height of the list of items. If the value is a `number` it will be 
     * treated as pixels, otherwise it should be a valid CSS size string. Default: Height of Popup Parent.
     */
    valueListMaxHeight?: number | string;
    /** The maximum width of the list of items. If the value is a `number` it will be 
     * treated as pixels, otherwise it should be a valid CSS size string. Default: Width of the cell being edited.
     */
    valueListMaxWidth?: number | string;
}

interface SelectCellEditorParams<TData = any, TValue = any, TContext = any> extends ISelectCellEditorParams<TValue>, ICellEditorParams<TData, TValue, TContext> {}

export class SelectCellEditor extends PopupComponent implements ICellEditorComp {

    private focusAfterAttached: boolean;

    @Autowired('valueService') private valueService: ValueService;
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

        const { eSelect, valueService, gos } = this;
        const { values, value, eventKey } = params;
        if (missing(values)) {
            console.warn('AG Grid: no values found for select cellEditor');
            return;
        }

        this.startedByEnter = eventKey != null ? eventKey === KeyCode.ENTER : false;

        let hasValue = false;
        values.forEach((currentValue: any) => {
            const option: ListOption = { value: currentValue };
            const valueFormatted = valueService.formatValue(params.column, null, currentValue);
            const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : currentValue;

            eSelect.addOption(option);
            hasValue = hasValue || value === currentValue;
        });

        if (hasValue) {
            eSelect.setValue(params.value, true);
        } else if (params.values.length) {
            eSelect.setValue(params.values[0], true);
        }

        const { valueListGap, valueListMaxWidth, valueListMaxHeight } = params;

        if (valueListGap != null) {
            eSelect.setPickerGap(valueListGap);
        }

        if (valueListMaxHeight != null) {
            eSelect.setPickerMaxHeight(valueListMaxHeight);
        }

        if (valueListMaxWidth != null) {
            eSelect.setPickerMaxWidth(valueListMaxWidth);
        }

        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (gos.get('editType') !== 'fullRow') {
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