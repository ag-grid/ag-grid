import type { IStatusBarService, IStatusPanelComp } from '@ag-grid-community/core';
import { Bean, BeanStub } from '@ag-grid-community/core';

@Bean('statusBarService')
export class StatusBarService extends BeanStub implements IStatusBarService {
    private allComponents: Map<string, IStatusPanelComp> = new Map();

    // tslint:disable-next-line
    constructor() {
        super();
    }

    public registerStatusPanel(key: string, component: IStatusPanelComp): void {
        this.allComponents.set(key, component);
    }

    public unregisterStatusPanel(key: string): void {
        this.allComponents.delete(key);
    }

    public unregisterAllComponents(): void {
        this.allComponents.clear();
    }

    public getStatusPanel(key: string): IStatusPanelComp {
        return this.allComponents.get(key)!;
    }

    public override destroy(): void {
        this.unregisterAllComponents();
        super.destroy();
    }
}
