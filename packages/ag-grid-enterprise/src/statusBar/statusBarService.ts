import {Bean, IStatusBarItemComp, IStatusBarService} from 'ag-grid-community';

@Bean('statusBarService')
export class StatusBarService implements IStatusBarService {

    private allComponents: { [p: string]: IStatusBarItemComp } = {};

    constructor() {
    }

    public registerStatusBarComponent(key: string, component: IStatusBarItemComp): void {
        this.allComponents[key] = component;
    }

    public getStatusBarComponent(key: string): IStatusBarItemComp {
        return this.allComponents[key];
    }
}
