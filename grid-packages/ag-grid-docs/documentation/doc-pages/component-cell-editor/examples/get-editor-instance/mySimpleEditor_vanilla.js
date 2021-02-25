const KEY_BACKSPACE = 8;
const KEY_F2 = 113;
const KEY_DELETE = 46;

class MySimpleEditor {
    init(params) {
        this.gui = document.createElement('input');
        this.gui.type = 'text';
        this.gui.classList.add('my-simple-editor');

        this.params = params;

        let startValue = params.value;

        const keyPressBackspaceOrDelete = params.keyPress === KEY_BACKSPACE || params.keyPress === KEY_DELETE;
        if (keyPressBackspaceOrDelete) {
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
