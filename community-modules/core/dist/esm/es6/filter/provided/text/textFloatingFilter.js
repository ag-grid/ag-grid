/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { TextFilter, TextFilterModelFormatter } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
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
}
