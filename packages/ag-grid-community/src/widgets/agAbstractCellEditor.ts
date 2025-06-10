import type { BaseCellEditorParams, ICellEditorValidationError } from '../interfaces/iCellEditor';
import type { AgAbstractField } from './agAbstractField';
import { PopupComponent } from './popupComponent';

export abstract class AgAbstractCellEditor<P extends BaseCellEditorParams> extends PopupComponent {
    protected abstract readonly eEditor: AgAbstractField<any, any, any>;
    protected abstract params: P;
    protected abstract getErrors(): string[] | null;
    protected abstract getEditorElement(): HTMLElement | HTMLInputElement;

    public postConstruct() {
        const el = this.getEditorElement();
        // override the browser's error message
        el.setAttribute('title', '');
    }

    public validateEdit(): ICellEditorValidationError | null {
        const { params } = this;
        const {
            column,
            node: { rowIndex, rowPinned },
        } = params;

        const messages = this.getErrors();
        const el = this.getEditorElement();

        if (el instanceof HTMLInputElement) {
            el.setCustomValidity(messages ? messages[0] : '');
        } else {
            el.classList.toggle('invalid');
        }

        if (!messages) {
            return null;
        }

        return { rowIndex: rowIndex!, rowPinned, column, messages };
    }
}
