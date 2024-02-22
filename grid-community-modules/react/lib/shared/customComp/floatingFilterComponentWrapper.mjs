// @ag-grid-community/react v31.1.1
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
import { updateFloatingFilterParent } from "./floatingFilterComponentProxy.mjs";
// floating filter is normally instantiated via react header filter cell comp, but not in the case of multi filter
export class FloatingFilterComponentWrapper extends CustomComponentWrapper {
    constructor() {
        super(...arguments);
        this.model = null;
        this.onModelChange = (model) => this.updateModel(model);
    }
    onParentModelChanged(parentModel) {
        this.model = parentModel;
        this.refreshProps();
    }
    refresh(newParams) {
        this.sourceParams = newParams;
        this.refreshProps();
    }
    getOptionalMethods() {
        return ['afterGuiAttached'];
    }
    updateModel(model) {
        this.model = model;
        this.refreshProps();
        // don't need to wait on `refreshProps` as not reliant on state maintained inside React
        updateFloatingFilterParent(this.sourceParams, model);
    }
    getProps() {
        const props = super.getProps();
        props.model = this.model;
        props.onModelChange = this.onModelChange;
        return props;
    }
}
