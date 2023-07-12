import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { AgAutocomplete } from './agAutocomplete';
import { Autowired, PostConstruct } from '../../context/context';
import { FilterExpressionService } from './filterExpressionService';
import { FilterManager } from '../filterManager';
import { ExpressionParser } from './expressionParser';

export class FilterExpressionBarComp extends Component {
    @RefSelector('eFilterAutocomplete') private eFilterAutocomplete: HTMLElement;
    @Autowired('filterExpressionService') private filterExpressionService: FilterExpressionService;
    @Autowired('filterManager') private filterManager: FilterManager;

    private expressionParser: ExpressionParser | null = null;

    constructor() {
        super(/* html */`
        <div style="padding: 10px; background-color: var(--ag-header-background-color); border-bottom: var(--ag-borders-critical) var(--ag-border-color);" role="presentation" ref="eFilterAutocomplete">
        </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        const autocomplete = this.createManagedBean(new AgAutocomplete({
            onValueChanged: (value) => {
                this.expressionParser = this.filterExpressionService.createExpressionParser(value);
                this.expressionParser?.parseExpression();
            },
            valueValidator: () => !this.expressionParser || this.expressionParser?.isValid() ? null : 'TODO - some error message',
            listGenerator: (_value, position) => {
                return this.expressionParser ? this.expressionParser.getAutocompleteListParams(position) : this.filterExpressionService.getDefaultAutocompleteListParams('');
            },
            onConfirmed: value => this.filterManager.setFilterExpression(value),
            valueUpdater: (value, position, updatedValuePart) => this.filterExpressionService.updateExpression(value ?? '', position, updatedValuePart)
        }));
        this.eFilterAutocomplete.appendChild(autocomplete.getGui());
    }
}
