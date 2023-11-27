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
const dom_1 = require("../../../utils/dom");
class FloatingFilterTextInputService extends beanStub_1.BeanStub {
    constructor(params) {
        super();
        this.params = params;
        this.valueChangedListener = () => { };
    }
    setupGui(parentElement) {
        var _a;
        this.eFloatingFilterTextInput = this.createManagedBean(new agInputTextField_1.AgInputTextField((_a = this.params) === null || _a === void 0 ? void 0 : _a.config));
        const eInput = this.eFloatingFilterTextInput.getGui();
        parentElement.appendChild(eInput);
        this.addManagedListener(eInput, 'input', (e) => this.valueChangedListener(e));
        this.addManagedListener(eInput, 'keydown', (e) => this.valueChangedListener(e));
    }
    setEditable(editable) {
        this.eFloatingFilterTextInput.setDisabled(!editable);
    }
    setAutoComplete(autoComplete) {
        this.eFloatingFilterTextInput.setAutoComplete(autoComplete);
    }
    getValue() {
        return this.eFloatingFilterTextInput.getValue();
    }
    setValue(value, silent) {
        this.eFloatingFilterTextInput.setValue(value, silent);
    }
    setValueChangedListener(listener) {
        this.valueChangedListener = listener;
    }
    setParams(params) {
        this.setAriaLabel(params.ariaLabel);
        if (params.autoComplete !== undefined) {
            this.setAutoComplete(params.autoComplete);
        }
    }
    setAriaLabel(ariaLabel) {
        this.eFloatingFilterTextInput.setInputAriaLabel(ariaLabel);
    }
}
exports.FloatingFilterTextInputService = FloatingFilterTextInputService;
;
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
        this.setupFloatingFilterInputService(params);
        super.init(params);
        this.setTextInputParams(params);
    }
    setupFloatingFilterInputService(params) {
        this.floatingFilterInputService = this.createFloatingFilterInputService(params);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);
    }
    setTextInputParams(params) {
        var _a;
        this.params = params;
        const autoComplete = (_a = params.browserAutoComplete) !== null && _a !== void 0 ? _a : false;
        this.floatingFilterInputService.setParams({
            ariaLabel: this.getAriaLabel(params),
            autoComplete,
        });
        this.applyActive = providedFilter_1.ProvidedFilter.isUseApplyButton(this.params.filterParams);
        if (!this.isReadOnly()) {
            const debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce = (0, function_1.debounce)(this.syncUpWithParentFilter.bind(this), debounceMs);
            this.floatingFilterInputService.setValueChangedListener(toDebounce);
        }
    }
    onParamsUpdated(params) {
        super.onParamsUpdated(params);
        this.setTextInputParams(params);
    }
    recreateFloatingFilterInputService(params) {
        const value = this.floatingFilterInputService.getValue();
        (0, dom_1.clearElement)(this.eFloatingFilterInputContainer);
        this.destroyBean(this.floatingFilterInputService);
        this.setupFloatingFilterInputService(params);
        this.floatingFilterInputService.setValue(value, true);
    }
    getAriaLabel(params) {
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        return `${displayName} ${translate('ariaFilterInput', 'Filter Input')}`;
    }
    syncUpWithParentFilter(e) {
        const isEnterKey = e.key === keyCode_1.KeyCode.ENTER;
        if (this.applyActive && !isEnterKey) {
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
    (0, context_1.Autowired)('columnModel')
], TextInputFloatingFilter.prototype, "columnModel", void 0);
__decorate([
    (0, componentAnnotations_1.RefSelector)('eFloatingFilterInputContainer')
], TextInputFloatingFilter.prototype, "eFloatingFilterInputContainer", void 0);
__decorate([
    context_1.PostConstruct
], TextInputFloatingFilter.prototype, "postConstruct", null);
exports.TextInputFloatingFilter = TextInputFloatingFilter;
