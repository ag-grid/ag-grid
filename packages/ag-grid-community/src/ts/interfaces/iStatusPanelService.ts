import {IStatusComp} from "./iStatus";

export interface IStatusPanelService {
    registerStatusPanelComponent(key: string, component: IStatusComp): void;
    getStatusPanelComponent(key: string): IStatusComp;

}