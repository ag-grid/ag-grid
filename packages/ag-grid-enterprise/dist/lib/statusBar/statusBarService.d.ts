// ag-grid-enterprise v19.0.0
import { IStatusPanelComp, IStatusBarService } from 'ag-grid-community';
export declare class StatusBarService implements IStatusBarService {
    private allComponents;
    constructor();
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    getStatusPanel(key: string): IStatusPanelComp;
}
