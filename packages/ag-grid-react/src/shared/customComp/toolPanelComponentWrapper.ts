import type { AgPromise, IToolPanel, IToolPanelParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomToolPanelProps } from './interfaces';

export class ToolPanelComponentWrapper
    extends CustomComponentWrapper<IToolPanelParams, CustomToolPanelProps, object>
    implements IToolPanel
{
    private state: any;
    private appliedParams: IToolPanelParams | undefined;
    private readonly onStateChange = (state: any) => this.updateState(state);

    public override init(params: IToolPanelParams): AgPromise<void> {
        this.applyInitialState(params);
        return super.init(params);
    }

    public refresh(params: IToolPanelParams): boolean {
        this.sourceParams = params;
        this.applyInitialState(params);
        this.refreshProps();
        return true;
    }

    /**
     * A restore hands over fresh params; `api.refreshToolPanel()` re-presents the applied ones, so the
     * state the component has since reported must survive it. The state object can be the same on
     * repeat restores.
     */
    private applyInitialState(params: IToolPanelParams): void {
        if (params.initialState !== undefined && params !== this.appliedParams) {
            this.state = params.initialState;
        }
        this.appliedParams = params;
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
