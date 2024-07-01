import type { IComponent } from 'ag-grid-community';
import { TabGuardComp } from 'ag-grid-community';
export declare class AgMenuPanel extends TabGuardComp {
    constructor(wrappedComponent: IComponent<any>);
    postConstruct(): void;
    private handleKeyDown;
    private onTabKeyDown;
    private closePanel;
}
