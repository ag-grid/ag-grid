// @ag-grid-community/react v31.0.2
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class FilterComponentWrapper extends CustomComponentWrapper {
    constructor() {
        super(...arguments);
        this.model = null;
    }
    isFilterActive() {
        return this.model != null;
    }
    doesFilterPass(params) {
        return this.providedMethods.doesFilterPass(params);
    }
    getModel() {
        return this.model;
    }
    setModel(model) {
        this.model = model;
        this.refreshProps();
    }
    refresh(newParams) {
        this.sourceParams = newParams;
        this.refreshProps();
        return true;
    }
    getOptionalMethods() {
        return ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onAnyFilterChanged'];
    }
    updateModel(model) {
        this.setModel(model);
        setTimeout(() => {
            // ensure prop updates have happened
            this.sourceParams.filterChangedCallback();
        });
    }
    getProps() {
        const props = Object.assign(Object.assign({}, this.sourceParams), { model: this.model, onModelChange: (model) => this.updateModel(model), onUiChange: () => this.sourceParams.filterChangedCallback(), key: this.key });
        // remove props in IFilterParams but not CustomFilterProps
        delete props.filterChangedCallback;
        delete props.filterModifiedCallback;
        delete props.valueGetter;
        return props;
    }
}
