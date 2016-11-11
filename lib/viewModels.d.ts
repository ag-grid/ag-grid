// ag-grid-aurelia v6.2.0
export interface IEditorViewModel {
    params: any;
    getValue(): any;
    isPopup(): boolean;
    isCancelBeforeStart(): boolean;
    isCancelAfterEnd(): boolean;
    focusIn(): void;
    focusOut(): void;
}
