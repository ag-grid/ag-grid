import type { ComponentSelector, IStatusBarService, IStatusPanelComp, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class StatusBarService extends BeanStub implements NamedBean, IStatusBarService {
    beanName: "statusBarService";
    private allComponents;
    constructor();
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    unregisterStatusPanel(key: string): void;
    unregisterAllComponents(): void;
    getStatusPanel(key: string): IStatusPanelComp;
    getStatusPanelSelector(): ComponentSelector;
    destroy(): void;
}
