import { ManagedFocusComponent, IComponent } from '@ag-grid-community/core';
export declare class MenuPanel extends ManagedFocusComponent {
    private readonly wrappedComponent;
    constructor(wrappedComponent: IComponent<any>);
    handleKeyDown(e: KeyboardEvent): void;
    onTabKeyDown(e: KeyboardEvent): void;
    private closePanel;
}
