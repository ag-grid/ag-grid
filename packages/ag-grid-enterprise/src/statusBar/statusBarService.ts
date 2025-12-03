import type { IStatusPanelComp, _NamedBean } from 'ag-grid-community';
import { _BeanStub } from 'ag-grid-community';

export class StatusBarService extends _BeanStub implements _NamedBean {
    beanName = 'statusBarSvc' as const;

    private readonly comps: Map<string, IStatusPanelComp> = new Map();

    // tslint:disable-next-line
    constructor() {
        super();
    }

    public registerStatusPanel(key: string, component: IStatusPanelComp): void {
        this.comps.set(key, component);
    }

    public unregisterStatusPanel(key: string): void {
        this.comps.delete(key);
    }

    public unregisterAllComponents(): void {
        this.comps.clear();
    }

    public getStatusPanel(key: string): IStatusPanelComp {
        return this.comps.get(key)!;
    }

    public override destroy(): void {
        this.unregisterAllComponents();
        super.destroy();
    }
}
