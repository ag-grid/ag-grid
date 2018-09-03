import {Bean, IStatusPanelComp, IStatusBarService} from 'ag-grid-community';

@Bean('statusBarService')
export class StatusBarService implements IStatusBarService {

    private allComponents: { [p: string]: IStatusPanelComp } = {};

    constructor() {}

    public registerStatusPanelComponent(key: string, component: IStatusPanelComp): void {
        this.allComponents[key] = component;
    }

    public getStatusPanelComponent(key: string): IStatusPanelComp {
        return this.allComponents[key];
    }
}
