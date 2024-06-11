import type { ComponentClass } from '../widgets/component';
import type { IStatusPanelComp } from './iStatusPanel';

export interface IStatusBarService {
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    getStatusPanel(key: string): IStatusPanelComp;
    getStatusPanelClass(): ComponentClass;
}
