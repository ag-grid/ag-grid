
function isCharNumeric(charStr) {
    return !!/\d/.test(charStr)
}

function isKeyPressedNumeric(event) {
    var charStr = event.key;
    return isCharNumeric(charStr)
}
// Implementing ICellEditorComp
class NumericCellEditor {
    focusAfterAttached
    eInput
    cancelBeforeStart
    // gets called once before the renderer is used
    init(params) {
        // we only want to highlight this cell if it started the edit, it is possible
        // another cell in this row started the edit
        this.focusAfterAttached = params.cellStartedEdit

        // create the cell
        this.eInput = document.createElement('input')
        this.eInput.classList.add('ag-input-field-input');
        this.eInput.style.width = '100%'
        this.eInput.style.height = '100%'
        this.eInput.value = (params.charPress && isCharNumeric(params.charPress))
            ? params.charPress
            : params.value

        this.eInput.addEventListener('keypress', (event) => {
            if (!isKeyPressedNumeric(event)) {
                this.eInput.focus()
                if (event.preventDefault) event.preventDefault()
            }
        })
    }

    // gets called once when grid ready to insert the element
    getGui() {
        return this.eInput
    }

    // focus and select can be done after the gui is attached
    afterGuiAttached() {
        // only focus after attached if this cell started the edit
        if (this.focusAfterAttached) {
            this.eInput.focus()
            this.eInput.select()
        }
    }

    // returns the new value after editing
    isCancelBeforeStart() {
        return this.cancelBeforeStart
    }

    // example - will reject the number if it contains the value 007
    // - not very practical, but demonstrates the method.
    isCancelAfterEnd() {
        return false;
    }

    // returns the new value after editing
    getValue() {
        return this.eInput.value
    }

    // when we tab onto this editor, we want to focus the contents
    focusIn() {
        var eInput = this.getGui()
        eInput.focus()
        eInput.select()
        console.log('NumericCellEditor.focusIn()')
    }

    // when we tab out of the editor, this gets called
    focusOut() {
        // but we don't care, we just want to print it for demo purposes
        console.log('NumericCellEditor.focusOut()')
    }
}