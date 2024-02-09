import { IToolPanel, IToolPanelParams } from "@ag-grid-community/core";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomToolPanelProps } from "./interfaces";

export class ToolPanelComponentWrapper extends CustomComponentWrapper<IToolPanelParams, CustomToolPanelProps, {}> implements IToolPanel {
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
        this.sourceParams.onStateUpdated();
    }

    protected getProps(): CustomToolPanelProps {
        return {
            ...this.sourceParams,
            key: this.key,
            state: this.state,
            onStateChange: this.onStateChange
        } as any;
    }
}
