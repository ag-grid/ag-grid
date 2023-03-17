/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DateFilter, DateFilterModelFormatter } from './dateFilter';
import { Autowired } from '../../../context/context';
import { DateCompWrapper } from './dateCompWrapper';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import { ProvidedFilter } from '../providedFilter';
import { setDisplayed } from '../../../utils/dom';
import { parseDateTimeFromString, serialiseDate } from '../../../utils/date';
import { debounce } from '../../../utils/function';
var DateFloatingFilter = /** @class */ (function (_super) {
    __extends(DateFloatingFilter, _super);
    function DateFloatingFilter() {
        return _super.call(this, /* html */ "\n            <div class=\"ag-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eReadOnlyText\"></ag-input-text-field>\n                <div ref=\"eDateWrapper\" style=\"display: flex;\"></div>\n            </div>") || this;
    }
    DateFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    };
    DateFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.params = params;
        this.filterParams = params.filterParams;
        this.createDateComponent();
        var translate = this.localeService.getLocaleTextFunc();
        this.eReadOnlyText
            .setDisabled(true)
            .setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
        this.filterModelFormatter = new DateFilterModelFormatter(this.filterParams, this.localeService, this.optionsFactory);
    };
    DateFloatingFilter.prototype.setEditable = function (editable) {
        setDisplayed(this.eDateWrapper, editable);
        setDisplayed(this.eReadOnlyText.getGui(), !editable);
    };
    DateFloatingFilter.prototype.onParentModelChanged = function (model, event) {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing.
        // This is similar for data changes, which don't affect provided date floating filters
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            return;
        }
        _super.prototype.setLastTypeFromModel.call(this, model);
        var allowEditing = !this.isReadOnly() &&
            this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(allowEditing);
        if (allowEditing) {
            if (model) {
                var dateModel = model;
                this.dateComp.setDate(parseDateTimeFromString(dateModel.dateFrom));
            }
            else {
                this.dateComp.setDate(null);
            }
            this.eReadOnlyText.setValue('');
        }
        else {
            this.eReadOnlyText.setValue(this.filterModelFormatter.getModelAsString(model));
            this.dateComp.setDate(null);
        }
    };
    DateFloatingFilter.prototype.onDateChanged = function () {
        var _this = this;
        var filterValueDate = this.dateComp.getDate();
        var filterValueText = serialiseDate(filterValueDate);
        this.params.parentFilterInstance(function (filterInstance) {
            if (filterInstance) {
                var date = parseDateTimeFromString(filterValueText);
                filterInstance.onFloatingFilterChanged(_this.getLastType() || null, date);
            }
        });
    };
    DateFloatingFilter.prototype.createDateComponent = function () {
        var _this = this;
        var debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        var dateComponentParams = {
            onDateChanged: debounce(this.onDateChanged.bind(this), debounceMs),
            filterParams: this.params.column.getColDef().filterParams
        };
        this.dateComp = new DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eDateWrapper);
        this.addDestroyFunc(function () { return _this.dateComp.destroy(); });
    };
    DateFloatingFilter.prototype.getFilterModelFormatter = function () {
        return this.filterModelFormatter;
    };
    __decorate([
        Autowired('userComponentFactory')
    ], DateFloatingFilter.prototype, "userComponentFactory", void 0);
    __decorate([
        RefSelector('eReadOnlyText')
    ], DateFloatingFilter.prototype, "eReadOnlyText", void 0);
    __decorate([
        RefSelector('eDateWrapper')
    ], DateFloatingFilter.prototype, "eDateWrapper", void 0);
    return DateFloatingFilter;
}(SimpleFloatingFilter));
export { DateFloatingFilter };
