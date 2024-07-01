import type { IComponent } from '@ag-grid-community/core';
import { TabGuardComp } from '@ag-grid-community/core';
export declare class AgMenuPanel extends TabGuardComp {
    constructor(wrappedComponent: IComponent<any>);
    postConstruct(): void;
    private handleKeyDown;
    private onTabKeyDown;
    private closePanel;
}
