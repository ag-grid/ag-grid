import { Bean, BeanStub, IStatusPanelComp, IStatusBarService } from '@ag-grid-community/core';

@Bean('statusBarService')
export class StatusBarService extends BeanStub implements IStatusBarService {

    private allComponents: { [p: string]: IStatusPanelComp } = {};

    // tslint:disable-next-line
    constructor() {
        super();
    }

    public registerStatusPanel(key: string, component: IStatusPanelComp): void {
        this.allComponents[key] = component;
    }

    public getStatusPanel(key: string): IStatusPanelComp {
        return this.allComponents[key];
    }
}
