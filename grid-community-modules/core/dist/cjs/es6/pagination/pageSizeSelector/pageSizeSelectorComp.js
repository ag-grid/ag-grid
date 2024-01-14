"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageSizeSelectorComp = void 0;
const component_1 = require("../../widgets/component");
const context_1 = require("../../context/context");
const main_1 = require("../../main");
const dom_1 = require("../../utils/dom");
const function_1 = require("../../utils/function");
class PageSizeSelectorComp extends component_1.Component {
    constructor() {
        super(/* html */ `<span class="ag-paging-page-size"></span>`);
        this.hasEmptyOption = false;
        this.handlePageSizeItemSelected = () => {
            if (!this.selectPageSizeComp) {
                return;
            }
            const newValue = this.selectPageSizeComp.getValue();
            if (!newValue) {
                return;
            }
            const paginationPageSize = Number(newValue);
            if (isNaN(paginationPageSize) ||
                paginationPageSize < 1 ||
                paginationPageSize === this.paginationProxy.getPageSize()) {
                return;
            }
            this.paginationProxy.setPageSize(paginationPageSize, 'pageSizeSelector');
            if (this.hasEmptyOption) {
                // Toggle the selector to force a refresh of the options and hide the empty option,
                // as it's no longer needed.
                this.toggleSelectDisplay(true);
            }
            this.selectPageSizeComp.getFocusableElement().focus();
        };
    }
    init() {
        this.addManagedPropertyListener('paginationPageSizeSelector', () => {
            this.onPageSizeSelectorValuesChange();
        });
        this.addManagedListener(this.eventService, main_1.Events.EVENT_PAGINATION_CHANGED, (event) => this.handlePaginationChanged(event));
    }
    handlePaginationChanged(paginationChangedEvent) {
        if (!this.selectPageSizeComp || !(paginationChangedEvent === null || paginationChangedEvent === void 0 ? void 0 : paginationChangedEvent.newPageSize)) {
            return;
        }
        const paginationPageSize = this.paginationProxy.getPageSize();
        if (this.getPageSizeSelectorValues().includes(paginationPageSize)) {
            this.selectPageSizeComp.setValue(paginationPageSize.toString());
        }
        else {
            if (this.hasEmptyOption) {
                this.selectPageSizeComp.setValue('');
            }
            else {
                this.toggleSelectDisplay(true);
            }
        }
    }
    toggleSelectDisplay(show) {
        if (this.selectPageSizeComp) {
            this.reset();
        }
        if (!show) {
            return;
        }
        this.reloadPageSizesSelector();
        if (!this.selectPageSizeComp) {
            return;
        }
        this.appendChild(this.selectPageSizeComp);
    }
    reset() {
        (0, dom_1.clearElement)(this.getGui());
        if (!this.selectPageSizeComp) {
            return;
        }
        this.destroyBean(this.selectPageSizeComp);
        this.selectPageSizeComp = undefined;
    }
    onPageSizeSelectorValuesChange() {
        if (!this.selectPageSizeComp) {
            return;
        }
        if (this.shouldShowPageSizeSelector()) {
            this.reloadPageSizesSelector();
        }
    }
    shouldShowPageSizeSelector() {
        return (this.gridOptionsService.get('pagination') &&
            !this.gridOptionsService.get('suppressPaginationPanel') &&
            !this.gridOptionsService.get('paginationAutoPageSize') &&
            this.gridOptionsService.get('paginationPageSizeSelector') !== false);
    }
    reloadPageSizesSelector() {
        const pageSizeOptions = this.getPageSizeSelectorValues();
        const paginationPageSizeOption = this.paginationProxy.getPageSize();
        const shouldAddAndSelectEmptyOption = !paginationPageSizeOption || !pageSizeOptions.includes(paginationPageSizeOption);
        if (shouldAddAndSelectEmptyOption) {
            // When the paginationPageSize option is set to a value that is
            // not in the list of page size options.
            pageSizeOptions.unshift('');
            (0, function_1.warnOnce)(`The paginationPageSize grid option is set to a value that is not in the list of page size options.
                Please make sure that the paginationPageSize grid option is set to one of the values in the 
                paginationPageSizeSelector array, or set the paginationPageSizeSelector to false to hide the page size selector.`);
        }
        if (this.selectPageSizeComp) {
            this.destroyBean(this.selectPageSizeComp);
            this.selectPageSizeComp = undefined;
        }
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const localisedLabel = localeTextFunc('pageSizeSelectorLabel', 'Page Size:');
        const options = pageSizeOptions.map(value => ({
            value: String(value),
            text: String(value)
        }));
        const localisedAriaLabel = localeTextFunc('ariaPageSizeSelectorLabel', 'Page Size');
        this.selectPageSizeComp = this.createManagedBean(new main_1.AgSelect())
            .addOptions(options)
            .setValue(String(shouldAddAndSelectEmptyOption ? '' : paginationPageSizeOption))
            .setAriaLabel(localisedAriaLabel)
            .setLabel(localisedLabel)
            .onValueChange(() => this.handlePageSizeItemSelected());
        this.hasEmptyOption = shouldAddAndSelectEmptyOption;
    }
    getPageSizeSelectorValues() {
        const defaultValues = [20, 50, 100];
        const paginationPageSizeSelectorValues = this.gridOptionsService.get('paginationPageSizeSelector');
        if (!Array.isArray(paginationPageSizeSelectorValues) ||
            !this.validateValues(paginationPageSizeSelectorValues)) {
            return defaultValues;
        }
        return [...paginationPageSizeSelectorValues].sort((a, b) => a - b);
    }
    validateValues(values) {
        if (!values.length) {
            (0, function_1.warnOnce)(`The paginationPageSizeSelector grid option is an empty array. This is most likely a mistake.
                If you want to hide the page size selector, please set the paginationPageSizeSelector to false.`);
            return false;
        }
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const isNumber = typeof value === 'number';
            const isPositive = value > 0;
            if (!isNumber) {
                (0, function_1.warnOnce)(`The paginationPageSizeSelector grid option contains a non-numeric value.
                    Please make sure that all values in the paginationPageSizeSelector array are numbers.`);
                return false;
            }
            if (!isPositive) {
                (0, function_1.warnOnce)(`The paginationPageSizeSelector grid option contains a negative number or zero.
                    Please make sure that all values in the paginationPageSizeSelector array are positive.`);
                return false;
            }
        }
        return true;
    }
    destroy() {
        this.toggleSelectDisplay(false);
        super.destroy();
    }
}
__decorate([
    (0, context_1.Autowired)('localeService')
], PageSizeSelectorComp.prototype, "localeService", void 0);
__decorate([
    (0, context_1.Autowired)('gridOptionsService')
], PageSizeSelectorComp.prototype, "gridOptionsService", void 0);
__decorate([
    (0, context_1.Autowired)('paginationProxy')
], PageSizeSelectorComp.prototype, "paginationProxy", void 0);
__decorate([
    context_1.PostConstruct
], PageSizeSelectorComp.prototype, "init", null);
exports.PageSizeSelectorComp = PageSizeSelectorComp;
