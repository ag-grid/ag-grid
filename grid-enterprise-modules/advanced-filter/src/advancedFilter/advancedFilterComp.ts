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
    PostConstruct,
    RefSelector,
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
    private expression: string | null = null;

    constructor() {
        super(/* html */ `
            <div class="ag-advanced-filter" role="presentation" tabindex="-1">
                <ag-autocomplete ref="eAutocomplete"></ag-autocomplete>
                <button class="ag-button ag-standard-button ag-advanced-filter-apply-button" ref="eApplyFilterButton"></button>
            </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        const translate = this.localeService.getLocaleTextFunc();

        this.eAutocomplete
            .setListGenerator((_value, position) => this.generateAutocompleteListParams(position))
            .setValidator(() => this.validateValue())
            .setForceLastSelection((lastSelection, searchString) => this.forceLastSelection(lastSelection, searchString))
            .setInputAriaLabel(translate('ariaLabelFilterExpressionInput', 'Advanced Filter Input'))
            .setListAriaLabel(translate('ariaLabelFilterExpressionAutocomplete', 'Advanced Filter Autocomplete'));

        this.refresh();

        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALUE_CHANGED,
            ({ value }: AutocompleteValueChangedEvent) => this.onValueChanged(value));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALUE_CONFIRMED,
            ({ value, isValid }: AutocompleteValueConfirmedEvent) => this.onValueConfirmed(value, isValid));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_OPTION_SELECTED,
            ({ position, updateEntry, autocompleteType }: AutocompleteOptionSelectedEvent) => this.onOptionSelected(position, updateEntry, autocompleteType));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALID_CHANGED,
            ({ isValid }: AutocompleteValidChangedEvent) => this.onValidChanged(isValid));

        this.eApplyFilterButton.innerText = translate('filterExpressionApply', 'Apply');
        this.activateTabIndex([this.eApplyFilterButton]);
        this.eApplyFilterButton.addEventListener('click', () => this.onValueConfirmed(this.eAutocomplete.getValue(), this.eAutocomplete.isValid()));
        _.setDisabled(this.eApplyFilterButton, true);
    }

    public refresh(): void {
        const expression = this.advancedFilterService.getExpressionDisplayValue();
        this.eAutocomplete.setValue(expression ?? '', expression?.length, true, true);
    }

    public setInputDisabled(disabled: boolean): void {
        this.eAutocomplete.setInputDisabled(disabled);
    }

    private onValueChanged(value: string | null): void {
        this.expression = value;
        this.expressionParser = this.advancedFilterService.createExpressionParser(value);
        const updatedExpression = this.expressionParser?.parseExpression();
        if (updatedExpression && updatedExpression !== value) {
            this.eAutocomplete.setValue(updatedExpression, undefined, true);
        }
    }

    private onValueConfirmed(value: string | null, isValid: boolean): void {
        if (!isValid) { return; }
        _.setDisabled(this.eApplyFilterButton, true);
        this.advancedFilterService.setExpressionDisplayValue(value);
        this.filterManager.onFilterChanged();
    }

    private onOptionSelected(position: number, updateEntry: AutocompleteEntry, type?: string): void {
        const { updatedValue, updatedPosition } = this.updateExpression(position, updateEntry, type);
        this.eAutocomplete.setValue(updatedValue, updatedPosition);
    }

    private validateValue(): string | null {
        return this.expressionParser?.isValid() ? null : (this.expressionParser?.getValidationMessage() ?? null);
    }

    private onValidChanged(isValid: boolean): void {
        _.setDisabled(this.eApplyFilterButton, !isValid || this.expression === this.advancedFilterService.getExpressionDisplayValue());
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
