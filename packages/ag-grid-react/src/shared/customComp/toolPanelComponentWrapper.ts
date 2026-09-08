import type { AgPromise, IToolPanel, IToolPanelParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomToolPanelProps } from './interfaces';

export class ToolPanelComponentWrapper
    extends CustomComponentWrapper<IToolPanelParams, CustomToolPanelProps, object>
    implements IToolPanel
{
    private state: any;
    private appliedInitialState: any;
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
     * `state` is documented as initially the same value as `initialState`, which the grid provides at
     * construction and again on every `api.setState` restore. A new object is a restore; the same one
     * is a re-render, and must not overwrite the state the component has since reported.
     */
    private applyInitialState(params: IToolPanelParams): void {
        const { initialState } = params;
        if (initialState !== undefined && initialState !== this.appliedInitialState) {
            this.state = initialState;
        }
        this.appliedInitialState = initialState;
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
