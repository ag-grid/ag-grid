import type { IToolPanel, IToolPanelParams } from 'ag-grid-community';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomToolPanelProps } from './interfaces';
export declare class ToolPanelComponentWrapper extends CustomComponentWrapper<IToolPanelParams, CustomToolPanelProps, object> implements IToolPanel {
    private state;
    private readonly onStateChange;
    refresh(params: IToolPanelParams): boolean;
    getState(): any;
    private updateState;
    protected getProps(): CustomToolPanelProps;
}
