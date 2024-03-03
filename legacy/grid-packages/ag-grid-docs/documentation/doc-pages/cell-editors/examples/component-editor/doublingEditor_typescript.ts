import { ICellEditorComp, ICellEditorParams } from "@ag-grid-community/core";

export class DoublingEditor implements ICellEditorComp {
    value: any;
    input!: HTMLInputElement;

    init(params: ICellEditorParams) {
        this.value = params.value;

        this.input = document.createElement('input');
        this.input.classList.add('doubling-input');
        this.input.id = 'input';
        this.input.type = 'number';
        this.input.value = this.value;

        this.input.addEventListener('input', (event: any) => {
            this.value = event.target.value;
        });
    }

    /* Component Editor Lifecycle methods */
    // gets called once when grid ready to insert the element
    getGui() {
        return this.input;
    }

    // the final value to send to the grid, on completion of editing
    getValue() {
        // this simple editor doubles any value entered into the input
        return this.value * 2;
    }

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    isCancelBeforeStart() {
        return false;
    }

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    isCancelAfterEnd() {
        // our editor will reject any value greater than 1000
        return this.value > 1000;
    }

    // after this component has been created and inserted into the grid
    afterGuiAttached() {
        this.input.focus();
    }
}

