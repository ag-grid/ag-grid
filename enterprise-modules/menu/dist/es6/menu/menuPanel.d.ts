import { TabGuardComp, IComponent } from '@ag-grid-community/core';
export declare class MenuPanel extends TabGuardComp {
    private readonly wrappedComponent;
    constructor(wrappedComponent: IComponent<any>);
    private postConstruct;
    private handleKeyDown;
    private onTabKeyDown;
    private closePanel;
}
