import { IStatusPanelComp, IStatusBarService } from '@ag-community/grid-core';
export declare class StatusBarService implements IStatusBarService {
    private allComponents;
    constructor();
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    getStatusPanel(key: string): IStatusPanelComp;
}
