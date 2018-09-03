import {IStatusBarItemComp} from "./iStatusBar";

export interface IStatusBarService {
    registerStatusBarComponent(key: string, component: IStatusBarItemComp): void;
    getStatusBarComponent(key: string): IStatusBarItemComp;

}