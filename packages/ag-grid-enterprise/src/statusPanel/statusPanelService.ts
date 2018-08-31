import {Bean, IStatusPanelItemComp, IStatusPanelService} from 'ag-grid-community';

@Bean('statusPanelService')
export class StatusPanelService implements IStatusPanelService {

    private allComponents: { [p: string]: IStatusPanelItemComp } = {};

    constructor() {
    }

    public registerStatusPanelComponent(key: string, component: IStatusPanelItemComp): void {
        this.allComponents[key] = component;
    }

    public getStatusPanelComponent(key: string): IStatusPanelItemComp {
        return this.allComponents[key];
    }
}
