import {IStatusPanelComp} from "./iStatusPanel";

export interface IStatusBarService {
    registerStatusPanelComponent(key: string, component: IStatusPanelComp): void;
    getStatusPanelComponent(key: string): IStatusPanelComp;

}