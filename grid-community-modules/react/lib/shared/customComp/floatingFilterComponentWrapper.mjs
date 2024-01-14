// @ag-grid-community/react v31.0.0
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
import { updateFloatingFilterParent } from "./floatingFilterComponentProxy.mjs";
// floating filter is normally instantiated via react header filter cell comp, but not in the case of multi filter
export class FloatingFilterComponentWrapper extends CustomComponentWrapper {
    constructor() {
        super(...arguments);
        this.model = null;
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
        updateFloatingFilterParent(this.sourceParams, model);
    }
    getProps() {
        return Object.assign(Object.assign({}, this.sourceParams), { model: this.model, onModelChange: model => this.updateModel(model), key: this.key });
    }
}
