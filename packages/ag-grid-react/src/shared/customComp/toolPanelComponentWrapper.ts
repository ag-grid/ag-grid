import type { IToolPanel, IToolPanelParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomToolPanelProps } from './interfaces';

export class ToolPanelComponentWrapper
    extends CustomComponentWrapper<IToolPanelParams, CustomToolPanelProps, object>
    implements IToolPanel
{
    private state: any;
    private readonly onStateChange = (state: any) => this.updateState(state);

    public refresh(params: IToolPanelParams): boolean {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    }

    public getState(): any {
        return this.state;
    }

    private updateState(state: any): void {
        this.state = state;
        this.refreshProps();
        // don't need to wait on `refreshProps` as not reliant on state maintained inside React
        this.sourceParams.onStateUpdated();
    }

    protected override getProps(): CustomToolPanelProps {
        const props = super.getProps();
        props.state = this.state;
        props.onStateChange = this.onStateChange;
        return props;
    }
}
