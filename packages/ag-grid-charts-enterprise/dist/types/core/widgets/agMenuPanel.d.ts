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
