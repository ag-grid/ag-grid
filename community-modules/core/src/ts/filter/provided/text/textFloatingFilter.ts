import { TextFilter, TextFilterModel } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { AgInputTextField } from '../../../widgets/agInputTextField';
export class TextFloatingFilter extends TextInputFloatingFilter {

    @RefSelector('eFloatingFilterInput') protected eFloatingFilterInput: AgInputTextField;
    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterInput"></ag-input-text-field>
            </div>`);
    }


    protected conditionToString(condition: TextFilterModel): string {
        // it's not possible to have 'in range' for string, so no need to check for it.
        // also cater for when the type doesn't need a value
        if (condition.filter != null) {
            return `${condition.filter}`;
        } else {
            return `${condition.type}`;
        }
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }
}
