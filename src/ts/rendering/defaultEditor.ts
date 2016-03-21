import {Utils as _} from "../utils";
import {Constants} from "../constants";

export class DefaultEditor {
    
    private eInput: HTMLInputElement;
    
    constructor() {
        this.eInput = document.createElement('input');
        this.eInput.type = 'text';
        _.addCssClass(this.eInput, 'ag-cell-edit-input');
    }
    
    public startEditing(params: any): void {

        var keyPress = params.keyPress;
        var value = params.value;
        var stopEditing = params.stopEditing;
        var focusCell = params.focusCell;
        var startEditingNextCell = params.startEditingNextCell;

        var eInput = this.eInput;

        var startWithOldValue = keyPress !== Constants.KEY_BACKSPACE && keyPress !== Constants.KEY_DELETE;
        if (startWithOldValue && value !== null && value !== undefined) {
            this.eInput.value = value;
        }

        this.eInput.style.width = (params.column.getActualWidth() - 14) + 'px';

        //stop editing if we loose focus
        this.eInput.addEventListener("blur", stopEditing);

        //If we don't remove the blur listener before calling stopEditing, then we get this error:
        //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node':
        // The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
        // I have no idea why :(

        this.eInput.addEventListener('keypress', (event: any) => {
            var key = event.which || event.keyCode;
            if (key === Constants.KEY_ENTER) {
                eInput.removeEventListener("blur", stopEditing);
                stopEditing();
                focusCell(true);
            }
        });

        this.eInput.addEventListener('keydown', (event: any) => {
            var key = event.which || event.keyCode;
            if (key === Constants.KEY_ESCAPE) {
                eInput.removeEventListener("blur", stopEditing);
                stopEditing(true);
                focusCell(true);
            } else if (key == Constants.KEY_TAB) {
                eInput.removeEventListener("blur", stopEditing);
                stopEditing();
                startEditingNextCell(event.shiftKey);
                // we don't want the default tab action, so return false, this stops the event from bubbling
                event.preventDefault();
                return false;
            }
        });
    }

    public afterGuiAttached(): void {
        this.eInput.focus();
        this.eInput.select();
    }

    public getValue(): any {
        return this.eInput.value;
    }

    public destroy(): void {
    }

    public getGui(): HTMLElement {
        return this.eInput;
    }
}