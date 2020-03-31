import {
    ICellEditor,
    PopupComponent,
    ICellEditorParams,
    ComponentMeta
} from "@ag-grid-community/core";
import { DateTimeList } from "../dateTimeList/dateTimeList";

export interface IDateTimeCellEditorParams extends ICellEditorParams {
    defaultDate?: Date | (() => Date);
    valueToDate?: (value: any) => Date;
    dateToValue?: (date: Date) => any;
}

export class DateTimeCellEditor extends PopupComponent implements ICellEditor {

    private static TEMPLATE = /*html*/ `<div class="ag-date-time-cell-editor" tabindex="0"></div>`;

    private params: IDateTimeCellEditorParams;
    private cancelled = false;
    private originalValue: object;
    private selectedDate: Date;
    private editor: DateTimeList;

    constructor() {
        super(DateTimeCellEditor.TEMPLATE);
    }

    public init(params: IDateTimeCellEditorParams): void {
        this.params = params;
        this.originalValue = params.value;

        let initialValue = params.valueToDate ? params.valueToDate(params.value) : new Date(params.value);
        if (isNaN(initialValue.getTime())) {
            const { defaultDate } = params;
            if (!defaultDate) {
                initialValue = new Date();
            } else if (typeof defaultDate === 'function') {
                initialValue = defaultDate();
            } else {
                initialValue = defaultDate;
            }
            initialValue = new Date();
        }
        this.editor = new DateTimeList({
            onValueSelect: this.handleValueSelect.bind(this),
            initialValue: initialValue
        });
        this.wireBean(this.editor);
        this.appendChild(this.editor);
    }

    public afterGuiAttached() {
        this.editor.getGui().focus();
    }

    private handleValueSelect(value: Date) {
        this.selectedDate = value;
        this.params.stopEditing();
    }

    public isPopup() {
        return true;
    }

    public getPopupPosition() {
        return 'under';
    }

    public isCancelAfterEnd() {
        return this.cancelled;
    }

    public getValue(): any {
        if (this.params.dateToValue && this.selectedDate) {
            return this.params.dateToValue(this.selectedDate);
        }
        return this.selectedDate || this.originalValue;
    }
}

type Foo = new () => Object;

export const f: ComponentMeta = {
    componentClass: DateTimeCellEditor,
    componentName: 'foo'
};
