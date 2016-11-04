export interface IAureliaEditorViewModel {
    params:any;

    getValue():any;

    isPopup():boolean;

    isCancelBeforeStart():boolean;

    isCancelAfterEnd():boolean;

    focusIn():void;

    focusOut():void;
}

/**
 * A base editor component for inline editing
 */
export abstract class BaseAureliaEditor implements IAureliaEditorViewModel{
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

    isCancelBeforeStart(): boolean {
        return false;
    }

    isCancelAfterEnd(): boolean {
        return false;
    }

    focusIn(): void {
    }

    focusOut(): void {
    }

}

