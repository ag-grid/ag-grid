var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DateFilter, DateFilterModelFormatter } from './dateFilter.mjs';
import { Autowired } from '../../../context/context.mjs';
import { DateCompWrapper } from './dateCompWrapper.mjs';
import { RefSelector } from '../../../widgets/componentAnnotations.mjs';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter.mjs';
import { ProvidedFilter } from '../providedFilter.mjs';
import { setDisplayed } from '../../../utils/dom.mjs';
import { parseDateTimeFromString, serialiseDate } from '../../../utils/date.mjs';
import { debounce } from '../../../utils/function.mjs';
export class DateFloatingFilter extends SimpleFloatingFilter {
    constructor() {
        super(/* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eReadOnlyText"></ag-input-text-field>
                <div ref="eDateWrapper" style="display: flex;"></div>
            </div>`);
    }
    getDefaultFilterOptions() {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }
    init(params) {
        super.init(params);
        this.params = params;
        this.filterParams = params.filterParams;
        this.createDateComponent();
        this.filterModelFormatter = new DateFilterModelFormatter(this.filterParams, this.localeService, this.optionsFactory);
        const translate = this.localeService.getLocaleTextFunc();
        this.eReadOnlyText
            .setDisabled(true)
            .setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
    }
    onParamsUpdated(params) {
        super.onParamsUpdated(params);
        this.params = params;
        this.filterParams = params.filterParams;
        this.updateDateComponent();
        this.filterModelFormatter.updateParams({ optionsFactory: this.optionsFactory, dateFilterParams: this.filterParams });
        this.updateCompOnModelChange(params.currentParentModel());
    }
    updateCompOnModelChange(model) {
        // Update the read-only text field
        const allowEditing = !this.isReadOnly() && this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(allowEditing);
        if (allowEditing) {
            if (model) {
                const dateModel = model;
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
    }
    setEditable(editable) {
        setDisplayed(this.eDateWrapper, editable);
        setDisplayed(this.eReadOnlyText.getGui(), !editable);
    }
    onParentModelChanged(model, event) {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing.
        // This is similar for data changes, which don't affect provided date floating filters
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            return;
        }
        super.setLastTypeFromModel(model);
        this.updateCompOnModelChange(model);
    }
    onDateChanged() {
        const filterValueDate = this.dateComp.getDate();
        const filterValueText = serialiseDate(filterValueDate);
        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                const date = parseDateTimeFromString(filterValueText);
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, date);
            }
        });
    }
    getDateComponentParams() {
        const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        return {
            onDateChanged: debounce(this.onDateChanged.bind(this), debounceMs),
            filterParams: this.params.column.getColDef().filterParams
        };
    }
    createDateComponent() {
        this.dateComp = new DateCompWrapper(this.getContext(), this.userComponentFactory, this.getDateComponentParams(), this.eDateWrapper);
        this.addDestroyFunc(() => this.dateComp.destroy());
    }
    updateDateComponent() {
        const params = this.getDateComponentParams();
        const { api, columnApi, context } = this.gridOptionsService;
        params.api = api;
        params.columnApi = columnApi;
        params.context = context;
        this.dateComp.updateParams(params);
    }
    getFilterModelFormatter() {
        return this.filterModelFormatter;
    }
}
__decorate([
    Autowired('userComponentFactory')
], DateFloatingFilter.prototype, "userComponentFactory", void 0);
__decorate([
    RefSelector('eReadOnlyText')
], DateFloatingFilter.prototype, "eReadOnlyText", void 0);
__decorate([
    RefSelector('eDateWrapper')
], DateFloatingFilter.prototype, "eDateWrapper", void 0);
