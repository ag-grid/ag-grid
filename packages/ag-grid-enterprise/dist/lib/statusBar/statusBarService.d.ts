// ag-grid-enterprise v19.1.3
import { IStatusPanelComp, IStatusBarService } from 'ag-grid-community';
export declare class StatusBarService implements IStatusBarService {
    private allComponents;
    constructor();
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    getStatusPanel(key: string): IStatusPanelComp;
}
//# sourceMappingURL=statusBarService.d.ts.map