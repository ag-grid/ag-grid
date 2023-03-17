/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { SimpleFilter, SimpleFilterModelFormatter } from '../simpleFilter';
import { ScalarFilter } from '../scalarFilter';
import { makeNull } from '../../../utils/generic';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { isBrowserChrome } from '../../../utils/browser';
import { setAriaRole } from '../../../utils/aria';
import { AgInputNumberField } from '../../../widgets/agInputNumberField';
export class NumberFilterModelFormatter extends SimpleFilterModelFormatter {
    conditionToString(condition, options) {
        const { numberOfInputs } = options || {};
        const isRange = condition.type == SimpleFilter.IN_RANGE || numberOfInputs === 2;
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
export function getAllowedCharPattern(filterParams) {
    const { allowedCharPattern } = filterParams !== null && filterParams !== void 0 ? filterParams : {};
    if (allowedCharPattern) {
        return allowedCharPattern;
    }
    if (!isBrowserChrome()) {
        // only Chrome and Edge (Chromium) have nice HTML5 number field handling, so for other browsers we provide an equivalent
        // constraint instead
        return '\\d\\-\\.';
    }
    return null;
}
export class NumberFilter extends ScalarFilter {
    constructor() {
        super('numberFilter');
        this.eValuesFrom = [];
        this.eValuesTo = [];
    }
    mapValuesFromModel(filterModel) {
        const { filter, filterTo, type } = filterModel || {};
        return [
            this.processValue(filter),
            this.processValue(filterTo),
        ].slice(0, this.getNumberOfInputs(type));
    }
    getDefaultDebounceMs() {
        return 500;
    }
    comparator() {
        return (left, right) => {
            if (left === right) {
                return 0;
            }
            return left < right ? 1 : -1;
        };
    }
    setParams(params) {
        this.numberFilterParams = params;
        super.setParams(params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    }
    getDefaultFilterOptions() {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
    createValueElement() {
        const allowedCharPattern = getAllowedCharPattern(this.numberFilterParams);
        const eCondition = document.createElement('div');
        eCondition.classList.add('ag-filter-body');
        setAriaRole(eCondition, 'presentation');
        this.createFromToElement(eCondition, this.eValuesFrom, 'from', allowedCharPattern);
        this.createFromToElement(eCondition, this.eValuesTo, 'to', allowedCharPattern);
        return eCondition;
    }
    createFromToElement(eCondition, eValues, fromTo, allowedCharPattern) {
        const eValue = this.createManagedBean(allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputNumberField());
        eValue.addCssClass(`ag-filter-${fromTo}`);
        eValue.addCssClass('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
    }
    removeValueElements(startPosition, deleteCount) {
        this.removeComponents(this.eValuesFrom, startPosition, deleteCount);
        this.removeComponents(this.eValuesTo, startPosition, deleteCount);
    }
    getValues(position) {
        const result = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(this.processValue(this.stringToFloat(element.getValue())));
            }
        });
        return result;
    }
    areSimpleModelsEqual(aSimple, bSimple) {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    }
    getFilterType() {
        return 'number';
    }
    processValue(value) {
        if (value == null) {
            return null;
        }
        return isNaN(value) ? null : value;
    }
    stringToFloat(value) {
        if (typeof value === 'number') {
            return value;
        }
        let filterText = makeNull(value);
        if (filterText != null && filterText.trim() === '') {
            filterText = null;
        }
        if (this.numberFilterParams.numberParser) {
            return this.numberFilterParams.numberParser(filterText);
        }
        return filterText == null || filterText.trim() === '-' ? null : parseFloat(filterText);
    }
    createCondition(position) {
        const type = this.getConditionType(position);
        const model = {
            filterType: this.getFilterType(),
            type
        };
        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = values[0];
        }
        if (values.length > 1) {
            model.filterTo = values[1];
        }
        return model;
    }
    getInputs(position) {
        if (position >= this.eValuesFrom.length) {
            return [null, null];
        }
        return [this.eValuesFrom[position], this.eValuesTo[position]];
    }
    getModelAsString(model) {
        var _a;
        return (_a = this.filterModelFormatter.getModelAsString(model)) !== null && _a !== void 0 ? _a : '';
    }
}
NumberFilter.DEFAULT_FILTER_OPTIONS = [
    ScalarFilter.EQUALS,
    ScalarFilter.NOT_EQUAL,
    ScalarFilter.LESS_THAN,
    ScalarFilter.LESS_THAN_OR_EQUAL,
    ScalarFilter.GREATER_THAN,
    ScalarFilter.GREATER_THAN_OR_EQUAL,
    ScalarFilter.IN_RANGE,
    ScalarFilter.BLANK,
    ScalarFilter.NOT_BLANK,
];
