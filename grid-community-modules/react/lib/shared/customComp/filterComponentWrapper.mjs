// @ag-grid-community/react v31.1.0
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class FilterComponentWrapper extends CustomComponentWrapper {
    constructor() {
        super(...arguments);
        this.model = null;
        this.onModelChange = (model) => this.updateModel(model);
        this.onUiChange = () => this.sourceParams.filterChangedCallback();
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
        return this.refreshProps();
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
        this.setModel(model).then(() => this.sourceParams.filterChangedCallback());
    }
    getProps() {
        const props = Object.assign(Object.assign({}, this.sourceParams), { model: this.model, onModelChange: this.onModelChange, onUiChange: this.onUiChange, key: this.key });
        // remove props in IFilterParams but not CustomFilterProps
        delete props.filterChangedCallback;
        delete props.filterModifiedCallback;
        delete props.valueGetter;
        return props;
    }
}
