/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
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
const context_1 = require("../../context/context");
const dom_1 = require("../../utils/dom");
const function_1 = require("../../utils/function");
const filterLocaleText_1 = require("../filterLocaleText");
const managedFocusFeature_1 = require("../../widgets/managedFocusFeature");
const set_1 = require("../../utils/set");
const component_1 = require("../../widgets/component");
/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with AG Grid extend this class. User filters do not
 * extend this class.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 */
class ProvidedFilter extends component_1.Component {
    constructor(filterNameKey) {
        super();
        this.filterNameKey = filterNameKey;
        this.applyActive = false;
        this.hidePopup = null;
        // after the user hits 'apply' the model gets copied to here. this is then the model that we use for
        // all filtering. so if user changes UI but doesn't hit apply, then the UI will be out of sync with this model.
        // this is what we want, as the UI should only become the 'active' filter once it's applied. when apply is
        // inactive, this model will be in sync (following the debounce ms). if the UI is not a valid filter
        // (eg the value is missing so nothing to filter on, or for set filter all checkboxes are checked so filter
        // not active) then this appliedModel will be null/undefined.
        this.appliedModel = null;
    }
    postConstruct() {
        this.resetTemplate(); // do this first to create the DOM
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(this.getFocusableElement(), {
            handleKeyDown: this.handleKeyDown.bind(this)
        }));
    }
    // override
    handleKeyDown(e) { }
    getFilterTitle() {
        return this.translate(this.filterNameKey);
    }
    isFilterActive() {
        // filter is active if we have a valid applied model
        return !!this.appliedModel;
    }
    resetTemplate(paramsMap) {
        let eGui = this.getGui();
        if (eGui) {
            eGui.removeEventListener('submit', this.onFormSubmit);
        }
        const templateString = /* html */ `
            <form class="ag-filter-wrapper">
                <div class="ag-filter-body-wrapper ag-${this.getCssIdentifier()}-body-wrapper">
                    ${this.createBodyTemplate()}
                </div>
            </form>`;
        this.setTemplate(templateString, paramsMap);
        eGui = this.getGui();
        if (eGui) {
            eGui.addEventListener('submit', this.onFormSubmit);
        }
    }
    isReadOnly() {
        return !!this.providedFilterParams.readOnly;
    }
    init(params) {
        this.setParams(params);
        this.resetUiToDefaults(true).then(() => {
            this.updateUiVisibility();
            this.setupOnBtApplyDebounce();
        });
    }
    setParams(params) {
        this.providedFilterParams = params;
        this.applyActive = ProvidedFilter.isUseApplyButton(params);
        this.createButtonPanel();
    }
    createButtonPanel() {
        const { buttons } = this.providedFilterParams;
        if (!buttons || buttons.length < 1 || this.isReadOnly()) {
            return;
        }
        const eButtonsPanel = document.createElement('div');
        eButtonsPanel.classList.add('ag-filter-apply-panel');
        const addButton = (type) => {
            let text;
            let clickListener;
            switch (type) {
                case 'apply':
                    text = this.translate('applyFilter');
                    clickListener = (e) => this.onBtApply(false, false, e);
                    break;
                case 'clear':
                    text = this.translate('clearFilter');
                    clickListener = () => this.onBtClear();
                    break;
                case 'reset':
                    text = this.translate('resetFilter');
                    clickListener = () => this.onBtReset();
                    break;
                case 'cancel':
                    text = this.translate('cancelFilter');
                    clickListener = (e) => { this.onBtCancel(e); };
                    break;
                default:
                    console.warn('AG Grid: Unknown button type specified');
                    return;
            }
            const buttonType = type === 'apply' ? 'submit' : 'button';
            const button = dom_1.loadTemplate(
            /* html */
            `<button
                    type="${buttonType}"
                    ref="${type}FilterButton"
                    class="ag-standard-button ag-filter-apply-panel-button"
                >${text}
                </button>`);
            eButtonsPanel.appendChild(button);
            this.addManagedListener(button, 'click', clickListener);
        };
        set_1.convertToSet(buttons).forEach(type => addButton(type));
        this.getGui().appendChild(eButtonsPanel);
    }
    // subclasses can override this to provide alternative debounce defaults
    getDefaultDebounceMs() {
        return 0;
    }
    setupOnBtApplyDebounce() {
        const debounceMs = ProvidedFilter.getDebounceMs(this.providedFilterParams, this.getDefaultDebounceMs());
        this.onBtApplyDebounce = function_1.debounce(this.onBtApply.bind(this), debounceMs);
    }
    getModel() {
        return this.appliedModel ? this.appliedModel : null;
    }
    setModel(model) {
        const promise = model != null ? this.setModelIntoUi(model) : this.resetUiToDefaults();
        return promise.then(() => {
            this.updateUiVisibility();
            // we set the model from the GUI, rather than the provided model,
            // so the model is consistent, e.g. handling of null/undefined will be the same,
            // or if model is case insensitive, then casing is removed.
            this.applyModel();
        });
    }
    onBtCancel(e) {
        const currentModel = this.getModel();
        const afterAppliedFunc = () => {
            this.onUiChanged(false, 'prevent');
            if (this.providedFilterParams.closeOnApply) {
                this.close(e);
            }
        };
        if (currentModel != null) {
            this.setModelIntoUi(currentModel).then(afterAppliedFunc);
        }
        else {
            this.resetUiToDefaults().then(afterAppliedFunc);
        }
    }
    onBtClear() {
        this.resetUiToDefaults().then(() => this.onUiChanged());
    }
    onBtReset() {
        this.onBtClear();
        this.onBtApply();
    }
    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    applyModel() {
        const newModel = this.getModelFromUi();
        if (!this.isModelValid(newModel)) {
            return false;
        }
        const previousModel = this.appliedModel;
        this.appliedModel = newModel;
        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        return !this.areModelsEqual(previousModel, newModel);
    }
    isModelValid(model) {
        return true;
    }
    onFormSubmit(e) {
        e.preventDefault();
    }
    onBtApply(afterFloatingFilter = false, afterDataChange = false, e) {
        // Prevent form submission
        if (e) {
            e.preventDefault();
        }
        if (this.applyModel()) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter, afterDataChange });
        }
        const { closeOnApply } = this.providedFilterParams;
        // only close if an apply button is visible, otherwise we'd be closing every time a change was made!
        if (closeOnApply && this.applyActive && !afterFloatingFilter && !afterDataChange) {
            this.close(e);
        }
    }
    onNewRowsLoaded() {
    }
    close(e) {
        if (!this.hidePopup) {
            return;
        }
        const keyboardEvent = e;
        const key = keyboardEvent && keyboardEvent.key;
        let params;
        if (key === 'Enter' || key === 'Space') {
            params = { keyboardEvent };
        }
        this.hidePopup(params);
        this.hidePopup = null;
    }
    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    onUiChanged(fromFloatingFilter = false, apply) {
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();
        if (this.applyActive && !this.isReadOnly) {
            const isValid = this.isModelValid(this.getModelFromUi());
            dom_1.setDisabled(this.getRefElement('applyFilterButton'), !isValid);
        }
        if ((fromFloatingFilter && !apply) || apply === 'immediately') {
            this.onBtApply(fromFloatingFilter);
        }
        else if ((!this.applyActive && !apply) || apply === 'debounce') {
            this.onBtApplyDebounce();
        }
    }
    afterGuiAttached(params) {
        if (params == null) {
            return;
        }
        this.hidePopup = params.hidePopup;
    }
    // static, as used by floating filter also
    static getDebounceMs(params, debounceDefault) {
        if (ProvidedFilter.isUseApplyButton(params)) {
            if (params.debounceMs != null) {
                console.warn('AG Grid: debounceMs is ignored when apply button is present');
            }
            return 0;
        }
        return params.debounceMs != null ? params.debounceMs : debounceDefault;
    }
    // static, as used by floating filter also
    static isUseApplyButton(params) {
        return !!params.buttons && params.buttons.indexOf('apply') >= 0;
    }
    destroy() {
        const eGui = this.getGui();
        if (eGui) {
            eGui.removeEventListener('submit', this.onFormSubmit);
        }
        this.hidePopup = null;
        super.destroy();
    }
    translate(key) {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(key, filterLocaleText_1.DEFAULT_FILTER_LOCALE_TEXT[key]);
    }
    getCellValue(rowNode) {
        const { api, colDef, column, columnApi, context } = this.providedFilterParams;
        return this.providedFilterParams.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: rowNode.data,
            getValue: (field) => rowNode.data[field],
            node: rowNode,
        });
    }
}
__decorate([
    context_1.Autowired('rowModel')
], ProvidedFilter.prototype, "rowModel", void 0);
__decorate([
    context_1.PostConstruct
], ProvidedFilter.prototype, "postConstruct", null);
exports.ProvidedFilter = ProvidedFilter;
