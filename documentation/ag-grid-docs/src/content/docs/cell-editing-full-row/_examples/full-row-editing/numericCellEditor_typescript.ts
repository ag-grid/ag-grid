import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

function isCharNumeric(charStr: string | null) {
    return charStr != null && !!/^\d+$/.test(charStr);
}

function isNumericKey(event: any) {
    const charStr = event.key;
    return isCharNumeric(charStr);
}

export class NumericCellEditor implements ICellEditorComp {
    focusAfterAttached!: boolean;
    eInput!: HTMLInputElement;
    cancelBeforeStart!: boolean;

    init(params: ICellEditorParams) {
        // we only want to highlight this cell if it started the edit; it's possible
        // another cell in this row started the edit
        this.focusAfterAttached = params.cellStartedEdit;

        this.eInput = document.createElement('input');
        this.eInput.classList.add('ag-input-field-input');
        this.eInput.style.width = '100%';

        this.eInput.value = isCharNumeric(params.eventKey) ? params.eventKey : params.value;

        this.eInput.addEventListener('keydown', (event) => {
            if (!event.key || event.key.length !== 1 || isNumericKey(event)) {
                return;
            }
            this.eInput.focus();

            if (event.preventDefault) event.preventDefault();
        });
    }

    getGui() {
        return this.eInput;
    }

    afterGuiAttached() {
        if (this.focusAfterAttached) {
            this.eInput.focus();
            this.eInput.select();
        }
    }

    getValue() {
        return this.eInput.value;
    }

    // when we tab into this editor, we want to focus the contents
    focusIn() {
        this.eInput.focus();
        this.eInput.select();
        console.log('NumericCellEditor.focusIn()');
    }

    // when we tab out of the editor, this gets called
    focusOut() {
        console.log('NumericCellEditor.focusOut()');
    }
}
