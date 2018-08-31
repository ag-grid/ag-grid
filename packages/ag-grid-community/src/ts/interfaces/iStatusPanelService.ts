import {IStatusPanelItemComp} from "./iStatusPanelItem";

export interface IStatusPanelService {
    registerStatusPanelComponent(key: string, component: IStatusPanelItemComp): void;
    getStatusPanelComponent(key: string): IStatusPanelItemComp;

}