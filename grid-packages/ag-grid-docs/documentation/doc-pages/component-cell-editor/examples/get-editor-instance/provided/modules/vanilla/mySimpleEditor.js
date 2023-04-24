// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';
const KEY_F2 = 'F2';

class MySimpleEditor {
    init(params) {
        this.gui = document.createElement('input');
        this.gui.type = 'text';
        this.gui.classList.add('my-simple-editor');

        this.params = params;

        let startValue = params.value;

        const isBackspace = params.eventKey === KEY_BACKSPACE;
        if (isBackspace) {
            startValue = '';
        } else if (params.charPress) {
            startValue = params.charPress;
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

    myCustomFunction() {
        return {
            rowIndex: this.params.rowIndex,
            colId: this.params.column.getId()
        };
    }
}
