import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { AgAutocomplete, AutocompleteOptionSelectedEvent, AutocompleteValidChangedEvent, AutocompleteValueChangedEvent, AutocompleteValueConfirmedEvent } from '../../widgets/agAutocomplete';
import { Autowired, PostConstruct } from '../../context/context';
import { FilterExpressionService } from './filterExpressionService';
import { FilterManager } from '../filterManager';
import { FilterExpressionParser } from './filterExpressionParser';
import { AutocompleteEntry, AutocompleteListParams } from '../../widgets/autocompleteParams';
import { setDisabled } from '../../utils/dom';
import { AutocompleteUpdate } from './filterExpressionUtils';

export class FilterExpressionBarComp extends Component {
    @RefSelector('eAutocomplete') private eAutocomplete: AgAutocomplete;
    @RefSelector('eApplyFilterButton') private eApplyFilterButton: HTMLElement;
    @Autowired('filterExpressionService') private filterExpressionService: FilterExpressionService;
    @Autowired('filterManager') private filterManager: FilterManager;

    private expressionParser: FilterExpressionParser | null = null;
    private expression: string | null = null;

    constructor() {
        super(/* html */ `
        <div style="padding: 10px; background-color: var(--ag-header-background-color); border-bottom: var(--ag-borders-critical) var(--ag-border-color); display: flex;" role="presentation">
            <ag-autocomplete ref="eAutocomplete"></ag-autocomplete>
            <button class="ag-button ag-standard-button ag-filter-apply-panel-button" style="line-height: 1;" ref="eApplyFilterButton"></button>
        </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        const translate = this.localeService.getLocaleTextFunc();

        this.eAutocomplete
            .setListGenerator((_value, position) => this.generateAutocompleteListParams(position))
            .setValidator(() => this.validateValue())
            .setInputAriaLabel(translate('ariaLabelFilterExpressionInput', 'Advanced Filter Input'))
            .setListAriaLabel(translate('ariaLabelFilterExpressionAutocomplete', 'Advanced Filter Autocomplete'));

        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALUE_CHANGED,
            ({ value }: AutocompleteValueChangedEvent) => this.onValueChanged(value));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALUE_CONFIRMED,
            ({ value, isValid }: AutocompleteValueConfirmedEvent) => this.onValueConfirmed(value, isValid));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_OPTION_SELECTED,
            ({ position, updateEntry, autocompleteType }: AutocompleteOptionSelectedEvent) => this.onOptionSelected(position, updateEntry, autocompleteType));
        this.addManagedListener(this.eAutocomplete, AgAutocomplete.EVENT_VALID_CHANGED,
            ({ isValid }: AutocompleteValidChangedEvent) => this.onValidChanged(isValid));

        this.eApplyFilterButton.innerText = translate('filterExpressionApply', 'Apply');
        this.eApplyFilterButton.addEventListener('click', () => this.onValueConfirmed(this.eAutocomplete.getValue(), this.eAutocomplete.isValid()));
        setDisabled(this.eApplyFilterButton, true);
    }

    private onValueChanged(value: string | null): void {
        this.expression = value;
        this.expressionParser = this.filterExpressionService.createExpressionParser(value);
        this.expressionParser?.parseExpression();
    }

    private onValueConfirmed(value: string | null, isValid: boolean): void {
        if (!isValid) { return; }
        this.filterManager.setFilterExpression(value);
        setDisabled(this.eApplyFilterButton, true);
    }

    private onOptionSelected(position: number, updateEntry: AutocompleteEntry, type?: string): void {
        const { updatedValue, updatedPosition } = this.updateExpression(position, updateEntry, type);
        this.eAutocomplete.setValue(updatedValue, updatedPosition);
    }

    private validateValue(): string | null {
        return this.expressionParser?.isValid() ? null : (this.expressionParser?.getValidationMessage() ?? null);
    }

    private onValidChanged(isValid: boolean): void {
        setDisabled(this.eApplyFilterButton, !isValid || this.expression === this.filterManager.getFilterExpression());
    }

    private generateAutocompleteListParams(position: number): AutocompleteListParams {
        return this.expressionParser
            ? this.expressionParser.getAutocompleteListParams(position)
            : this.filterExpressionService.getDefaultAutocompleteListParams('');
    }

    private updateExpression(
        position: number,
        updateEntry: AutocompleteEntry,
        type?: string
    ): AutocompleteUpdate {
        this.filterExpressionService.updateAutocompleteCache(updateEntry, type);
        return this.expressionParser?.updateExpression(position, updateEntry, type) ?? this.filterExpressionService.getDefaultExpression(updateEntry);
    }
}
