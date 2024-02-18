// @ag-grid-community/react v31.1.0
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class ToolPanelComponentWrapper extends CustomComponentWrapper {
    constructor() {
        super(...arguments);
        this.onStateChange = (state) => this.updateState(state);
    }
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
        // don't need to wait on `refreshProps` as not reliant on state maintained inside React
        this.sourceParams.onStateUpdated();
    }
    getProps() {
        return Object.assign(Object.assign({}, this.sourceParams), { key: this.key, state: this.state, onStateChange: this.onStateChange });
    }
}
