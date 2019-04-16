import {IDoesFilterPassParams} from "../../interfaces/iFilter";
import {QuerySelector} from "../../widgets/componentAnnotations";
import {AbstractFilter, CombinedFilter, FilterConditionType, IComparableFilterParams} from "./abstractFilter";
import {_} from "../../utils";

/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export abstract class AbstractComparableFilter<T, P extends IComparableFilterParams, M> extends AbstractFilter<P, M> {

    @QuerySelector('#filterType')
    private eTypeSelector: HTMLSelectElement;

    @QuerySelector('#filterConditionType')
    private eTypeConditionSelector: HTMLSelectElement;

    private suppressAndOrCondition: boolean;

    private eConditionWrapper: HTMLElement;

    public abstract getApplicableFilterTypes(): string[];
    public abstract filterValues(type:FilterConditionType): T | T[];
    public abstract individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType): boolean;

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        const mainFilterResult = this.individualFilterPasses(params, FilterConditionType.MAIN);
        if (this.eTypeConditionSelector == null) {
            return mainFilterResult;
        }

        const auxFilterResult = this.individualFilterPasses(params, FilterConditionType.CONDITION);
        return this.conditionValue === 'AND' ? mainFilterResult && auxFilterResult : mainFilterResult || auxFilterResult;
    }

    public init(params: P) {
        super.init(params);
        this.suppressAndOrCondition = params.suppressAndOrCondition;
    }

    public customInit() {
        if (!this.defaultFilter) {
            this.defaultFilter = this.getDefaultType();
        }
    }

    public allowTwoConditions(): boolean {
        return this.suppressAndOrCondition !== true;
    }

    protected abstract generateFilterValueTemplate(type: FilterConditionType): string;

    protected bodyTemplate(): string {
        const optionsHtml = this.generateFilterOperatorTemplate(FilterConditionType.MAIN);
        const centerHtml = this.generateFilterValueTemplate(FilterConditionType.MAIN);
        const template = optionsHtml + centerHtml;

        const showTwoConditions = this.allowTwoConditions();

        const bodyWithTwoConditions = showTwoConditions ?
            this.wrapCondition(template) :
            template;

        return bodyWithTwoConditions;
    }

    public onFilterChanged(applyNow: boolean = false): void {
        super.onFilterChanged(applyNow);
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
    }

    public setModel(model: M | CombinedFilter<M>): void {
        super.setModel(model);
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
    }

    private refreshOperatorUi() {
        const andButton: HTMLInputElement = this.eConditionWrapper.querySelector('.and') as HTMLInputElement;
        const orButton: HTMLInputElement = this.eConditionWrapper.querySelector('.or') as HTMLInputElement;
        this.conditionValue = this.conditionValue == null ? 'AND' : this.conditionValue;

        andButton.checked = this.conditionValue === 'AND';
        orButton.checked = this.conditionValue === 'OR';
        return {andButton, orButton};
    }

    private redrawCondition() {
        const filterCondition: HTMLElement = this.eFilterBodyWrapper.querySelector('.ag-filter-condition') as HTMLElement;
        if (!filterCondition && this.isFilterActive() && this.allowTwoConditions()) {
            this.eConditionWrapper = _.loadTemplate(this.createConditionTemplate(FilterConditionType.CONDITION));
            this.eFilterBodyWrapper.appendChild(this.eConditionWrapper);
            this.wireQuerySelectors();
            const {andButton, orButton} = this.refreshOperatorUi();

            this.addDestroyableEventListener(andButton, 'change', () => {
                this.conditionValue = 'AND';
                this.onFilterChanged();
            });
            this.addDestroyableEventListener(orButton, 'change', () => {
                this.conditionValue = 'OR';
                this.onFilterChanged();
            });
            this.initialiseFilterBodyUi(FilterConditionType.CONDITION);
        } else if (filterCondition && !this.isFilterActive()) {

            // reset condition filter state
            this.conditionValue = 'AND';
            this.resetState(true);

            this.eFilterBodyWrapper.removeChild(this.eConditionWrapper);
            this.eConditionWrapper = null;
        } else {
            this.refreshFilterBodyUi(FilterConditionType.CONDITION);
            if (this.eConditionWrapper) {
                this.refreshOperatorUi();
            }
        }
    }

    public wrapCondition(mainCondition:string): string {
        const filterNotActive = !this.isFilterActive();
        if (filterNotActive) {
            return mainCondition;
        } else {
            return  `${mainCondition}${this.createConditionTemplate(FilterConditionType.CONDITION)}`;
        }
    }

    private createConditionTemplate(type:FilterConditionType): string {

        const optionsHtml = this.generateFilterOperatorTemplate(type);
        const centerHtml = this.generateFilterValueTemplate(type);
        const template = optionsHtml + centerHtml;

        return `<div class="ag-filter-condition">
            <input id="andId" type="radio" class="and" name="booleanLogic" value=${this.translate('AND')}
                   checked="checked" /><label style="display: inline" for="andId">${this.translate('andCondition')}</label>
            <input id="orId" type="radio" class="or" name="booleanLogic" value="OR" /><label style="display: inline"
                   for="orId">${this.translate('orCondition')}</label>
            <div>${template}</div>
        </div>`;
    }

    private generateFilterOperatorTemplate(type:FilterConditionType): string {
        const defaultFilterTypes = this.getApplicableFilterTypes();
        const restrictedFilterTypes = this.filterParams.filterOptions;

        const actualFilterTypes = restrictedFilterTypes ? restrictedFilterTypes : defaultFilterTypes;

        const optionsHtml: string[] = actualFilterTypes.map(filter => {
            const filterName = (typeof filter === 'string') ? filter : filter.displayKey;
            const localeFilterName = this.translate(filterName);
            return `<option value="${filterName}">${localeFilterName}</option>`;
        });

        const readOnly = optionsHtml.length == 1 ? 'disabled' : '';
        const id:string = type == FilterConditionType.MAIN ? 'filterType' : 'filterConditionType';

        return optionsHtml.length <= 0 ?
            '' :
            `<div>
                <select class="ag-filter-select" id="${id}" ${readOnly}>
                    ${optionsHtml.join('')}
                </select>
            </div>`;
    }

    public initialiseFilterBodyUi(type:FilterConditionType) {
        if (type === FilterConditionType.MAIN) {
            this.setFilterType(this.selectedFilter, type);
            this.addDestroyableEventListener(this.eTypeSelector, "change", () => this.onFilterTypeChanged (type));
        } else {
            this.setFilterType(this.selectedFilterCondition, type);
            this.addDestroyableEventListener(this.eTypeConditionSelector, "change", () => this.onFilterTypeChanged (type));
        }
    }

    public abstract getDefaultType(): string;

    private onFilterTypeChanged(type:FilterConditionType): void {
        const prevSelectedFilter = this.selectedFilter;

        if (type === FilterConditionType.MAIN) {
            this.selectedFilter = this.eTypeSelector.value;
        } else {
            this.selectedFilterCondition = this.eTypeConditionSelector.value;
        }
        this.refreshFilterBodyUi(type);

        const prevSelectedFilterHadNoInput = this.doesFilterHaveHiddenInput(prevSelectedFilter);

        // only fire 'onFilterChanged' event if filter is active, as in it contains a filter value, or if the previously
        // selected filter didn't require a value, i.e. if custom filter has 'hideFilterInputField = true'
        if (this.isFilterActive() || prevSelectedFilterHadNoInput) {

            // reset when switching back to the empty filter to remove conditional filter
            if (this.selectedFilter === AbstractFilter.EMPTY) {
                this.resetState();
            }

            this.onFilterChanged();
        }
    }

    public isFilterActive(): boolean {

        // the main selected filter is always active when there is no input field
        if (this.doesFilterHaveHiddenInput(this.selectedFilter)) {
            return true;
        }

        const rawFilterValues = this.filterValues(FilterConditionType.MAIN);
        if (rawFilterValues && this.selectedFilter === AbstractFilter.IN_RANGE) {
            const filterValueArray = (rawFilterValues as T[]);
            return filterValueArray[0] != null && filterValueArray[1] != null;
        } else {
            return rawFilterValues != null;
        }
    }

    public setFilterType(filterType: string, type:FilterConditionType): void {
        if (type === FilterConditionType.MAIN) {
            this.selectedFilter = filterType;

            if (!this.eTypeSelector) { return; }
            this.eTypeSelector.value = filterType;
        } else {
            this.selectedFilterCondition = filterType;

            if (!this.eTypeConditionSelector) { return; }
            this.eTypeConditionSelector.value = filterType;
        }
    }

    isFilterConditionActive(type: FilterConditionType): boolean {
        return this.filterValues(type) != null;
    }
}
