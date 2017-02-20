// ag-grid-aurelia v8.1.0
/**
 * Implements all the methods of ICellEditor except for Init
 */
export interface IAureliaEditorViewModel {
    params: any;
    afterGuiAttached?(): void;
    getGui?(): HTMLElement;
    getValue(): any;
    destroy?(): void;
    isPopup?(): boolean;
    isCancelBeforeStart?(): boolean;
    /** Gets called once after editing is complete. If your return true, then the new value will not be used. The
     *  editing will have no impact on the record. Use this if you do not want a new value from your gui, i.e. you
     *  want to cancel the editing. */
    isCancelAfterEnd?(): boolean;
    focusIn?(): boolean;
    focusOut?(): boolean;
}
/**
 * A base editor component for inline editing
 */
export declare abstract class BaseAureliaEditor implements IAureliaEditorViewModel {
    /**
     * populated by ag-grid
     */
    params: any;
    constructor();
    getValue(): any;
    isPopup(): boolean;
}
