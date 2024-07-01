import type { IStatusPanel, IStatusPanelParams } from 'ag-grid-community';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomStatusPanelProps } from './interfaces';
export declare class StatusPanelComponentWrapper extends CustomComponentWrapper<IStatusPanelParams, CustomStatusPanelProps, object> implements IStatusPanel {
    refresh(params: IStatusPanelParams): boolean;
}
