import { BeanStub, IStatusPanelComp, IStatusBarService } from 'ag-grid-community';
export declare class StatusBarService extends BeanStub implements IStatusBarService {
    private allComponents;
    constructor();
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    unregisterStatusPanel(key: string): void;
    unregisterAllComponents(): void;
    getStatusPanel(key: string): IStatusPanelComp;
    protected destroy(): void;
}
