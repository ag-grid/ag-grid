import { TextFilter, TextFilterModelFormatter } from './textFilter.mjs';
import { FloatingFilterTextInputService, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter.mjs';
export class TextFloatingFilter extends TextInputFloatingFilter {
    init(params) {
        super.init(params);
        this.filterModelFormatter = new TextFilterModelFormatter(this.localeService, this.optionsFactory);
    }
    getDefaultFilterOptions() {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }
    getFilterModelFormatter() {
        return this.filterModelFormatter;
    }
    createFloatingFilterInputService(ariaLabel) {
        return this.createManagedBean(new FloatingFilterTextInputService({
            ariaLabel
        }));
    }
}
