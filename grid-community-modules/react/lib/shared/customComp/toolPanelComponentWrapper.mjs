// @ag-grid-community/react v31.0.2
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class ToolPanelComponentWrapper extends CustomComponentWrapper {
    refresh(params) {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    }
    getState() {
        return this.state;
    }
    updateState(state) {
        this.state = state;
        this.refreshProps();
        this.sourceParams.onStateUpdated();
    }
    getProps() {
        return Object.assign(Object.assign({}, this.sourceParams), { key: this.key, state: this.state, onStateChange: (state) => this.updateState(state) });
    }
}
