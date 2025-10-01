import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

export class SimpleTextEditor implements ICellEditorComp {
    gui!: HTMLInputElement;
    params!: ICellEditorParams;

    init(params: ICellEditorParams) {
        this.gui = document.createElement('input');
        this.gui.type = 'text';
        this.gui.classList.add('my-simple-editor');

        this.params = params;

        let startValue = params.value;
        const eventKey = params.eventKey;
        const isBackspace = eventKey === 'Backspace';

        if (isBackspace) {
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            startValue = eventKey;
        }

        if (startValue !== null && startValue !== undefined) {
            this.gui.value = startValue;
        }
    }

    getGui() {
        return this.gui;
    }

    getValue() {
        return this.gui.value;
    }

    afterGuiAttached() {
        this.gui.focus();
    }
}
