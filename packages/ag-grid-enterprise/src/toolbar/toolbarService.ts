import type { IToolbarItemComp, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class ToolbarService extends BeanStub implements NamedBean {
    beanName = 'toolbarSvc' as const;

    private readonly comps: Map<string, IToolbarItemComp> = new Map();

    // tslint:disable-next-line
    constructor() {
        super();
    }

    public registerToolbarItem(key: string, component: IToolbarItemComp): void {
        this.comps.set(key, component);
    }

    public unregisterToolbarItem(key: string): void {
        this.comps.delete(key);
    }

    public unregisterAllComponents(): void {
        this.comps.clear();
    }

    public getToolbarItem(key: string): IToolbarItemComp {
        return this.comps.get(key)!;
    }

    public override destroy(): void {
        this.unregisterAllComponents();
        super.destroy();
    }
}
