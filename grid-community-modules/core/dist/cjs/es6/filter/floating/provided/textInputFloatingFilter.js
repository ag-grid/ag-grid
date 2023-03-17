/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInputFloatingFilter = exports.FloatingFilterTextInputService = void 0;
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const function_1 = require("../../../utils/function");
const providedFilter_1 = require("../../provided/providedFilter");
const context_1 = require("../../../context/context");
const simpleFloatingFilter_1 = require("./simpleFloatingFilter");
const agInputTextField_1 = require("../../../widgets/agInputTextField");
const keyCode_1 = require("../../../constants/keyCode");
const textFilter_1 = require("../../provided/text/textFilter");
const beanStub_1 = require("../../../context/beanStub");
class FloatingFilterTextInputService extends beanStub_1.BeanStub {
    constructor(params) {
        super();
        this.params = params;
    }
    setupGui(parentElement) {
        this.eFloatingFilterTextInput = this.createManagedBean(new agInputTextField_1.AgInputTextField(this.params.config));
        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);
        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    }
    setEditable(editable) {
        this.eFloatingFilterTextInput.setDisabled(!editable);
    }
    getValue() {
        return this.eFloatingFilterTextInput.getValue();
    }
    setValue(value, silent) {
        this.eFloatingFilterTextInput.setValue(value, silent);
    }
    addValueChangedListener(listener) {
        const inputGui = this.eFloatingFilterTextInput.getGui();
        this.addManagedListener(inputGui, 'input', listener);
        this.addManagedListener(inputGui, 'keypress', listener);
        this.addManagedListener(inputGui, 'keydown', listener);
    }
}
exports.FloatingFilterTextInputService = FloatingFilterTextInputService;
class TextInputFloatingFilter extends simpleFloatingFilter_1.SimpleFloatingFilter {
    postConstruct() {
        this.setTemplate(/* html */ `
            <div class="ag-floating-filter-input" role="presentation" ref="eFloatingFilterInputContainer"></div>
        `);
    }
    getDefaultDebounceMs() {
        return 500;
    }
    onParentModelChanged(model, event) {
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            // if the floating filter triggered the change, it is already in sync.
            // Data changes also do not affect provided text floating filters
            return;
        }
        this.setLastTypeFromModel(model);
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
        this.floatingFilterInputService.setValue(this.getFilterModelFormatter().getModelAsString(model));
    }
    init(params) {
        this.params = params;
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        const ariaLabel = `${displayName} ${translate('ariaFilterInput', 'Filter Input')}`;
        this.floatingFilterInputService = this.createFloatingFilterInputService(ariaLabel);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);
        super.init(params);
        this.applyActive = providedFilter_1.ProvidedFilter.isUseApplyButton(this.params.filterParams);
        if (!this.isReadOnly()) {
            const debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce = function_1.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
            this.floatingFilterInputService.addValueChangedListener(toDebounce);
        }
    }
    syncUpWithParentFilter(e) {
        const enterKeyPressed = e.key === keyCode_1.KeyCode.ENTER;
        if (this.applyActive && !enterKeyPressed) {
            return;
        }
        let value = this.floatingFilterInputService.getValue();
        if (this.params.filterParams.trimInput) {
            value = textFilter_1.TextFilter.trimInput(value);
            this.floatingFilterInputService.setValue(value, true); // ensure visible value is trimmed
        }
        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, value || null);
            }
        });
    }
    setEditable(editable) {
        this.floatingFilterInputService.setEditable(editable);
    }
}
__decorate([
    context_1.Autowired('columnModel')
], TextInputFloatingFilter.prototype, "columnModel", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eFloatingFilterInputContainer')
], TextInputFloatingFilter.prototype, "eFloatingFilterInputContainer", void 0);
__decorate([
    context_1.PostConstruct
], TextInputFloatingFilter.prototype, "postConstruct", null);
exports.TextInputFloatingFilter = TextInputFloatingFilter;
