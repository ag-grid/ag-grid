import type { ComponentSelector } from '../widgets/component';
import type { IStatusPanelComp } from './iStatusPanel';
export interface IStatusBarService {
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    getStatusPanel(key: string): IStatusPanelComp;
    getStatusPanelSelector(): ComponentSelector;
}
