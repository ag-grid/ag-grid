// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { TabGuardComp } from './tabGuardComp';
import { IComponent } from '../interfaces/iComponent';
export declare class AgMenuPanel extends TabGuardComp {
    private readonly wrappedComponent;
    constructor(wrappedComponent: IComponent<any>);
    private postConstruct;
    private handleKeyDown;
    private onTabKeyDown;
    private closePanel;
}
