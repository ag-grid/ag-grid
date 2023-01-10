/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { TextFilter } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
export class TextFloatingFilter extends TextInputFloatingFilter {
    getDefaultFilterOptions() {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }
}
