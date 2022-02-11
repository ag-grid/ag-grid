/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { NumberFilter } from './numberFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
export class NumberFloatingFilter extends TextInputFloatingFilter {
    getDefaultFilterOptions() {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
}
