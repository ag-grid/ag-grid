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
const dateFilter_1 = require("./dateFilter");
const context_1 = require("../../../context/context");
const dateCompWrapper_1 = require("./dateCompWrapper");
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const simpleFilter_1 = require("../simpleFilter");
const simpleFloatingFilter_1 = require("../../floating/provided/simpleFloatingFilter");
const providedFilter_1 = require("../providedFilter");
const dom_1 = require("../../../utils/dom");
const date_1 = require("../../../utils/date");
const function_1 = require("../../../utils/function");
class DateFloatingFilter extends simpleFloatingFilter_1.SimpleFloatingFilter {
    constructor() {
        super(/* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eReadOnlyText"></ag-input-text-field>
                <div ref="eDateWrapper" style="display: flex;"></div>
            </div>`);
    }
    getDefaultFilterOptions() {
        return dateFilter_1.DateFilter.DEFAULT_FILTER_OPTIONS;
    }
    conditionToString(condition, options) {
        const { type } = condition;
        const { numberOfInputs } = options || {};
        const isRange = type == simpleFilter_1.SimpleFilter.IN_RANGE || numberOfInputs === 2;
        const dateFrom = date_1.parseDateTimeFromString(condition.dateFrom);
        const dateTo = date_1.parseDateTimeFromString(condition.dateTo);
        const format = this.filterParams.inRangeFloatingFilterDateFormat;
        if (isRange) {
            const formattedFrom = dateFrom !== null ? date_1.dateToFormattedString(dateFrom, format) : 'null';
            const formattedTo = dateTo !== null ? date_1.dateToFormattedString(dateTo, format) : 'null';
            return `${formattedFrom}-${formattedTo}`;
        }
        if (dateFrom != null) {
            return date_1.dateToFormattedString(dateFrom, format);
        }
        // cater for when the type doesn't need a value
        return `${type}`;
    }
    init(params) {
        super.init(params);
        this.params = params;
        this.filterParams = params.filterParams;
        this.createDateComponent();
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eReadOnlyText
            .setDisabled(true)
            .setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
    }
    setEditable(editable) {
        dom_1.setDisplayed(this.eDateWrapper, editable);
        dom_1.setDisplayed(this.eReadOnlyText.getGui(), !editable);
    }
    onParentModelChanged(model, event) {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) {
            return;
        }
        super.setLastTypeFromModel(model);
        const allowEditing = !this.isReadOnly() &&
            this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(allowEditing);
        if (allowEditing) {
            if (model) {
                const dateModel = model;
                this.dateComp.setDate(date_1.parseDateTimeFromString(dateModel.dateFrom));
            }
            else {
                this.dateComp.setDate(null);
            }
            this.eReadOnlyText.setValue('');
        }
        else {
            this.eReadOnlyText.setValue(this.getTextFromModel(model));
            this.dateComp.setDate(null);
        }
    }
    onDateChanged() {
        const filterValueDate = this.dateComp.getDate();
        const filterValueText = date_1.serialiseDate(filterValueDate);
        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                const date = date_1.parseDateTimeFromString(filterValueText);
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, date);
            }
        });
    }
    createDateComponent() {
        const debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        const dateComponentParams = {
            onDateChanged: function_1.debounce(this.onDateChanged.bind(this), debounceMs),
            filterParams: this.params.column.getColDef().filterParams
        };
        this.dateComp = new dateCompWrapper_1.DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eDateWrapper);
        this.addDestroyFunc(() => this.dateComp.destroy());
    }
}
__decorate([
    context_1.Autowired('userComponentFactory')
], DateFloatingFilter.prototype, "userComponentFactory", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eReadOnlyText')
], DateFloatingFilter.prototype, "eReadOnlyText", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eDateWrapper')
], DateFloatingFilter.prototype, "eDateWrapper", void 0);
exports.DateFloatingFilter = DateFloatingFilter;
