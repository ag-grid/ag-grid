// @ag-grid-community/react v31.0.3
import { AgPromise } from "@ag-grid-community/core";
import { addOptionalMethods } from "./customComponentWrapper.mjs";
export class CellEditorComponentProxy {
    constructor(cellEditorParams, refreshProps) {
        this.cellEditorParams = cellEditorParams;
        this.refreshProps = refreshProps;
        this.instanceCreated = new AgPromise(resolve => {
            this.resolveInstanceCreated = resolve;
        });
        this.value = cellEditorParams.value;
    }
    getProps() {
        return Object.assign(Object.assign({}, this.cellEditorParams), { initialValue: this.cellEditorParams.value, value: this.value, onValueChange: value => this.updateValue(value) });
    }
    getValue() {
        return this.value;
    }
    refresh(params) {
        this.cellEditorParams = params;
        this.refreshProps();
    }
    setMethods(methods) {
        addOptionalMethods(this.getOptionalMethods(), methods, this);
    }
    getInstance() {
        return this.instanceCreated.then(() => this.componentInstance);
    }
    setRef(componentInstance) {
        var _a;
        this.componentInstance = componentInstance;
        (_a = this.resolveInstanceCreated) === null || _a === void 0 ? void 0 : _a.call(this);
        this.resolveInstanceCreated = undefined;
    }
    getOptionalMethods() {
        return ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'getPopupPosition', 'focusIn', 'focusOut', 'afterGuiAttached'];
    }
    updateValue(value) {
        this.value = value;
        this.refreshProps();
    }
}
