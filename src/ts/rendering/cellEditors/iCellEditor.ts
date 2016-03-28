export interface ICellEditor {
    init?(params: any): void;
    afterGuiAttached?(): void;
    getGui(): HTMLElement;
    getValue(): any;
    destroy?(): void;
    isPopup?(): boolean;
}