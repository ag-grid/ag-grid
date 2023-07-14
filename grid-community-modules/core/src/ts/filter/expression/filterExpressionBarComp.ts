import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { AgAutocomplete } from './agAutocomplete';
import { Autowired, PostConstruct } from '../../context/context';
import { FilterExpressionService } from './filterExpressionService';
import { FilterManager } from '../filterManager';
import { ExpressionParser } from './expressionParser';
import { AutocompleteEntry, AutocompleteListParams, AutoCompleteUpdate } from './autocompleteParams';

export class FilterExpressionBarComp extends Component {
    @RefSelector('eFilterAutocomplete') private eFilterAutocomplete: HTMLElement;
    @Autowired('filterExpressionService') private filterExpressionService: FilterExpressionService;
    @Autowired('filterManager') private filterManager: FilterManager;

    private expressionParser: ExpressionParser | null = null;

    constructor() {
        super(/* html */ `
        <div style="padding: 10px; background-color: var(--ag-header-background-color); border-bottom: var(--ag-borders-critical) var(--ag-border-color);" role="presentation" ref="eFilterAutocomplete">
        </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const autocomplete = this.createManagedBean(
            new AgAutocomplete({
                onValueChanged: (value) => this.createExpressionParser(value),
                valueValidator: () => this.validateValue(),
                listGenerator: (_value, position) => this.generateAutocompleteListParams(position),
                onConfirmed: (value) => this.filterManager.setFilterExpression(value),
                valueUpdater: ({ position, updateEntry, type }) =>
                    this.updateExpression(position, updateEntry, type),
                ariaLabel: translate('ariaLabelFilterExpressionAutocomplete', 'Filter Expression Autocomplete')
            })
        );
        this.eFilterAutocomplete.appendChild(autocomplete.getGui());
    }

    private createExpressionParser(value: string | null): void {
        this.expressionParser = this.filterExpressionService.createExpressionParser(value);
        this.expressionParser?.parseExpression();
    }

    private validateValue(): string | null {
        return !this.expressionParser || this.expressionParser?.isValid() ? null : 'TODO - some error message';
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
    ): AutoCompleteUpdate {
        this.filterExpressionService.updateAutocompleteCache(updateEntry, type);
        return this.expressionParser?.updateExpression(position, updateEntry) ?? this.filterExpressionService.getDefaultExpression(updateEntry);
    }
}
