import { IToolPanel, IToolPanelParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";
import { CustomToolPanelProps } from "./interfaces";

export class ToolPanelComponent extends CustomComponent<IToolPanelParams, CustomToolPanelProps, {}> implements IToolPanel {
    private state: any;

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
            onStateChange: (state: any) => this.updateState(state)
        } as any;
    }
}
