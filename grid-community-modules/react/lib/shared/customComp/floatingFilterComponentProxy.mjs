// @ag-grid-community/react v31.1.1
import { AgPromise } from "@ag-grid-community/core";
import { addOptionalMethods } from "./customComponentWrapper.mjs";
export function updateFloatingFilterParent(params, model) {
    params.parentFilterInstance(instance => {
        (instance.setModel(model) || AgPromise.resolve()).then(() => {
            params.filterParams.filterChangedCallback();
        });
    });
}
export class FloatingFilterComponentProxy {
    constructor(floatingFilterParams, refreshProps) {
        this.floatingFilterParams = floatingFilterParams;
        this.refreshProps = refreshProps;
        this.model = null;
        this.onModelChange = (model) => this.updateModel(model);
    }
    getProps() {
        return Object.assign(Object.assign({}, this.floatingFilterParams), { model: this.model, onModelChange: this.onModelChange });
    }
    onParentModelChanged(parentModel) {
        this.model = parentModel;
        this.refreshProps();
    }
    refresh(params) {
        this.floatingFilterParams = params;
        this.refreshProps();
    }
    setMethods(methods) {
        addOptionalMethods(this.getOptionalMethods(), methods, this);
    }
    getOptionalMethods() {
        return ['afterGuiAttached'];
    }
    updateModel(model) {
        this.model = model;
        this.refreshProps();
        updateFloatingFilterParent(this.floatingFilterParams, model);
    }
}
