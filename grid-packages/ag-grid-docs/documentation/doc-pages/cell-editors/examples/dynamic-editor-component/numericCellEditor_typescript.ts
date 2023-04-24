import { ICellEditorComp, ICellEditorParams } from "@ag-grid-community/core";

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';
export class NumericCellEditor implements ICellEditorComp {
    eInput!: HTMLInputElement;
    cancelBeforeStart: any;

    // gets called once before the renderer is used
    init(params: ICellEditorParams) {
        // create the cell
        this.eInput = document.createElement('input');
        this.eInput.className = 'simple-input-editor';

        if (params.eventKey === KEY_BACKSPACE) {
            this.eInput.value = '';
        } else if (this.isCharNumeric(params.charPress)) {
            this.eInput.value = params.charPress!;
        } else {
            if (params.value !== undefined && params.value !== null) {
                this.eInput.value = params.value;
            }
        }

        this.eInput.addEventListener('keypress', (event) => {
            if (!this.isKeyPressedNumeric(event)) {
                this.eInput.focus();
                if (event.preventDefault) event.preventDefault();
            } else if (this.isKeyPressedNavigation(event) || this.isBackspace(event)) {
                event.stopPropagation();
            }
        });

        // only start edit if key pressed is a number, not a letter
        var charPressIsNotANumber = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
        this.cancelBeforeStart = !!charPressIsNotANumber;
    }

    isKeyPressedNumeric(event: any) {
        const charStr = event.key;
        return this.isCharNumeric(charStr);
    }

    isBackspace(event: any) {
        return event.key === KEY_BACKSPACE;
    }

    isKeyPressedNavigation(event: any) {
        return event.key === 'ArrowLeft'
            || event.key === 'ArrowRight';
    }

    isCharNumeric(charStr: string | null) {
        return charStr && !!/\d/.test(charStr);
    }

    // gets called once when grid ready to insert the element
    getGui() {
        return this.eInput;
    }

    // focus and select can be done after the gui is attached
    afterGuiAttached() {
        this.eInput.focus();
    }

    // returns the new value after editing
    isCancelBeforeStart() {
        return this.cancelBeforeStart;
    }

    // example - will reject the number if it contains the value 007
    // - not very practical, but demonstrates the method.
    isCancelAfterEnd() {
        var value = this.getValue();
        return value.indexOf('007') >= 0;
    }

    // returns the new value after editing
    getValue() {
        return this.eInput.value;
    }

    // any cleanup we need to be done here
    destroy() {
        // but this example is simple, no cleanup, we could  even leave this method out as it's optional
    }
}