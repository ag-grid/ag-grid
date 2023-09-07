import {
    AgAutocomplete,
    AutocompleteEntry,
    AutocompleteListParams,
    AutocompleteOptionSelectedEvent,
    AutocompleteValidChangedEvent,
    AutocompleteValueChangedEvent,
    AutocompleteValueConfirmedEvent,
    Autowired,
    Component,
    FilterManager,
    ITooltipParams,
    PostConstruct,
    RefSelector,
    WithoutGridCommon,
    _
} from '@ag-grid-community/core';
import { AdvancedFilterService } from './advancedFilterService';
import { FilterExpressionParser } from './filterExpressionParser';
import { AutocompleteUpdate } from './filterExpressionUtils';

export class AdvancedFilterComp extends Component {
    @RefSelector('eAutocomplete') private eAutocomplete: AgAutocomplete;
    @RefSelector('eApplyFilterButton') private eApplyFilterButton: HTMLElement;
    @Autowired('advancedFilterService') private advancedFilterService: AdvancedFilterService;
    @Autowired('filterManager') private filterManager: FilterManager;

    private expressionParser: FilterExpressionParser | null = null;
    private isApplyDisabled = true;

    constructor() {
        super(/* html */ `
            <div class="ag-advanced-filter" role="presentation" tabindex="-1">
                <ag-autocomplete ref="eAutocomplete"></ag-autocomplete>
                <button class="ag-button ag-standard-button ag-advanced-filter-apply-button" ref="eApplyFilterButton"></button>
            </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.eAutocomplete
            .setListGenerator((_value, position) => this.generateAutocompleteListParams(position))
            .setValidator(() => this.validateValue())
            .setForceLastSelection((lastSelection, searchString) => this.forceLastSelection(lastSelection, searchString))
            .setInputAriaLabel(this.advancedFilterService.translate('ariaAdvancedFilterInput'))
            .setListAriaLabel(this.advancedFilterService.translate('ariaLabelAdvancedFilterAutocomplete'));

        this.refresh();

        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALUE_CHANGED,
            ({ value }: AutocompleteValueChangedEvent) => this.onValueChanged(value));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALUE_CONFIRMED,
            ({ isValid }: AutocompleteValueConfirmedEvent) => this.onValueConfirmed(isValid));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_OPTION_SELECTED,
            ({ position, updateEntry, autocompleteType }: AutocompleteOptionSelectedEvent) => this.onOptionSelected(position, updateEntry, autocompleteType));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALID_CHANGED,
            ({ isValid, validationMessage }: AutocompleteValidChangedEvent) => this.onValidChanged(isValid, validationMessage));

        this.eApplyFilterButton.innerText = this.advancedFilterService.translate('advancedFilterApply');
        this.activateTabIndex([this.eApplyFilterButton]);
        this.eApplyFilterButton.addEventListener('click', () => this.onValueConfirmed(this.eAutocomplete.isValid()));
        _.setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
    }

    public refresh(): void {
        const expression = this.advancedFilterService.getExpressionDisplayValue();
        this.eAutocomplete.setValue({ value: expression ?? '', position: expression?.length, updateListOnlyIfOpen: true });
    }

    public setInputDisabled(disabled: boolean): void {
        this.eAutocomplete.setInputDisabled(disabled);
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'advancedFilter';
        return res;
    }

    private onValueChanged(value: string | null): void {
        value = _.makeNull(value);
        this.advancedFilterService.setExpressionDisplayValue(value);
        this.expressionParser = this.advancedFilterService.createExpressionParser(value);
        const updatedExpression = this.expressionParser?.parseExpression();
        if (updatedExpression && updatedExpression !== value) {
            this.eAutocomplete.setValue({ value: updatedExpression, silent: true, restoreFocus: true });
        }
    }

    private onValueConfirmed(isValid: boolean): void {
        if (!isValid || this.isApplyDisabled) { return; }
        _.setDisabled(this.eApplyFilterButton, true);
        this.advancedFilterService.applyExpression();
        this.filterManager.onFilterChanged({ source: 'advancedFilter' });
    }

    private onOptionSelected(position: number, updateEntry: AutocompleteEntry, type?: string): void {
        const { updatedValue, updatedPosition, hideAutocomplete } = this.updateExpression(position, updateEntry, type);
        this.eAutocomplete.setValue({
            value: updatedValue,
            position: updatedPosition,
            updateListOnlyIfOpen: hideAutocomplete, 
            restoreFocus: true
        });
    }

    private validateValue(): string | null {
        return this.expressionParser?.isValid() ? null : (this.expressionParser?.getValidationMessage() ?? null);
    }

    private onValidChanged(isValid: boolean, validationMessage: string | null): void {
        this.isApplyDisabled = !isValid || this.advancedFilterService.isCurrentExpressionApplied();
        _.setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
        this.setTooltip(validationMessage, 1000);
    }

    private generateAutocompleteListParams(position: number): AutocompleteListParams {
        return this.expressionParser
            ? this.expressionParser.getAutocompleteListParams(position)
            : this.advancedFilterService.getDefaultAutocompleteListParams('');
    }

    private updateExpression(
        position: number,
        updateEntry: AutocompleteEntry,
        type?: string
    ): AutocompleteUpdate {
        this.advancedFilterService.updateAutocompleteCache(updateEntry, type);
        return this.expressionParser?.updateExpression(position, updateEntry, type) ?? this.advancedFilterService.getDefaultExpression(updateEntry);
    }

    private forceLastSelection({ key, displayValue }: AutocompleteEntry, searchString: string): boolean {
        return !!searchString.toLocaleLowerCase().match(`^${(displayValue ?? key).toLocaleLowerCase()}\\s*$`);
    }
}
