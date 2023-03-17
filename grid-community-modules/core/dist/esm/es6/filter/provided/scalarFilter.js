/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { SimpleFilter } from "./simpleFilter";
export class ScalarFilter extends SimpleFilter {
    setParams(params) {
        super.setParams(params);
        this.scalarFilterParams = params;
    }
    evaluateNullValue(filterType) {
        switch (filterType) {
            case ScalarFilter.EQUALS:
            case ScalarFilter.NOT_EQUAL:
                if (this.scalarFilterParams.includeBlanksInEquals) {
                    return true;
                }
                break;
            case ScalarFilter.GREATER_THAN:
            case ScalarFilter.GREATER_THAN_OR_EQUAL:
                if (this.scalarFilterParams.includeBlanksInGreaterThan) {
                    return true;
                }
                break;
            case ScalarFilter.LESS_THAN:
            case ScalarFilter.LESS_THAN_OR_EQUAL:
                if (this.scalarFilterParams.includeBlanksInLessThan) {
                    return true;
                }
                break;
            case ScalarFilter.IN_RANGE:
                if (this.scalarFilterParams.includeBlanksInRange) {
                    return true;
                }
                break;
            case ScalarFilter.BLANK:
                return true;
            case ScalarFilter.NOT_BLANK:
                return false;
        }
        return false;
    }
    evaluateNonNullValue(values, cellValue, filterModel) {
        const comparator = this.comparator();
        const compareResult = values[0] != null ? comparator(values[0], cellValue) : 0;
        switch (filterModel.type) {
            case ScalarFilter.EQUALS:
                return compareResult === 0;
            case ScalarFilter.NOT_EQUAL:
                return compareResult !== 0;
            case ScalarFilter.GREATER_THAN:
                return compareResult > 0;
            case ScalarFilter.GREATER_THAN_OR_EQUAL:
                return compareResult >= 0;
            case ScalarFilter.LESS_THAN:
                return compareResult < 0;
            case ScalarFilter.LESS_THAN_OR_EQUAL:
                return compareResult <= 0;
            case ScalarFilter.IN_RANGE: {
                const compareToResult = comparator(values[1], cellValue);
                return this.scalarFilterParams.inRangeInclusive ?
                    compareResult >= 0 && compareToResult <= 0 :
                    compareResult > 0 && compareToResult < 0;
            }
            case ScalarFilter.BLANK:
                return this.isBlank(cellValue);
            case ScalarFilter.NOT_BLANK:
                return !this.isBlank(cellValue);
            default:
                console.warn('AG Grid: Unexpected type of filter "' + filterModel.type + '", it looks like the filter was configured with incorrect Filter Options');
                return true;
        }
    }
}
