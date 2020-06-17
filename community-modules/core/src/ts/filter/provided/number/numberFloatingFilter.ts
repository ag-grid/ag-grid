import { NumberFilter, NumberFilterModel } from './numberFilter';
import { SimpleFilter } from '../simpleFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { AgInputNumberField } from '../../../widgets/agInputNumberField';

export class NumberFloatingFilter extends TextInputFloatingFilter {

    @RefSelector('eFloatingFilterInput') protected eFloatingFilterInput: AgInputNumberField;
    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-number-field ref="eFloatingFilterInput"></ag-input-number-field>
            </div>`);
    } 

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected conditionToString(condition: NumberFilterModel): string {
        const isRange = condition.type == SimpleFilter.IN_RANGE;

        if (isRange) {
            return `${condition.filter}-${condition.filterTo}`;
        }

        // cater for when the type doesn't need a value
        if (condition.filter != null) {
            return `${condition.filter}`;
        }

        return `${condition.type}`;
    }
}
