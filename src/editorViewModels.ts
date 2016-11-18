/**
 * Implements all the methods of ICellEditor except for Init
 */
export interface IAureliaEditorViewModel {
    params: any;


    // Gets called once after GUI is attached to DOM.
    // Useful if you want to focus or highlight a component
    // (this is not possible when the element is not attached)
    afterGuiAttached?(): void;

    // Return the DOM element of your editor, this is what the grid puts into the DOM
    getGui?(): HTMLElement;

    // Should return the final value to the grid, the result of the editing
    getValue(): any;

    // Gets called once by grid after editing is finished
    // if your editor needs to do any cleanup, do it here
    destroy?(): void;

    // Gets called once after initialised.
    // If you return true, the editor will appear in a popup
    isPopup?(): boolean;

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    isCancelBeforeStart?(): boolean;

    /** Gets called once after editing is complete. If your return true, then the new value will not be used. The
     *  editing will have no impact on the record. Use this if you do not want a new value from your gui, i.e. you
     *  want to cancel the editing. */
    isCancelAfterEnd?(): boolean;

    // If doing full row edit, then gets called when tabbing into the cell.
    focusIn?(): boolean;

    // If doing full row edit, then gets called when tabbing out of the cell.
    focusOut?(): boolean;

}

/**
 * A base editor component for inline editing
 */
export abstract class BaseAureliaEditor implements IAureliaEditorViewModel {
    /**
     * populated by ag-grid
     */
    params: any;

    constructor() {
    }

    getValue(): any {
        return this.params.value;
    }

    isPopup(): boolean {
        return false;
    }
}

