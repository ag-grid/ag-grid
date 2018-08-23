import {Bean, IStatusComp, IStatusPanelService} from 'ag-grid-community';

@Bean('statusPanelService')
export class StatusPanelService implements IStatusPanelService {

    private allComponents: { [p: string]: IStatusComp } = {};

    constructor() {
    }

    public registerStatusPanelComponent(key: string, component: IStatusComp): void {
        this.allComponents[key] = component;
    }

    public getStatusPanelComponent(key: string): IStatusComp {
        return this.allComponents[key];
    }
}
