/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { SimpleFilter, SimpleFilterModelFormatter } from '../simpleFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { makeNull } from '../../../utils/generic';
import { _ } from '../../../utils';
import { setAriaRole } from '../../../utils/aria';
export class TextFilterModelFormatter extends SimpleFilterModelFormatter {
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
export class TextFilter extends SimpleFilter {
    constructor() {
        super('textFilter');
        this.eValuesFrom = [];
        this.eValuesTo = [];
    }
    static trimInput(value) {
        const trimmedInput = value && value.trim();
        // trim the input, unless it is all whitespace (this is consistent with Excel behaviour)
        return trimmedInput === '' ? value : trimmedInput;
    }
    getDefaultDebounceMs() {
        return 500;
    }
    setParams(params) {
        this.textFilterParams = params;
        super.setParams(params);
        this.matcher = this.getTextMatcher();
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);
        this.filterModelFormatter = new TextFilterModelFormatter(this.localeService, this.optionsFactory);
    }
    getTextMatcher() {
        const legacyComparator = this.textFilterParams.textCustomComparator;
        if (legacyComparator) {
            _.doOnce(() => console.warn('AG Grid - textCustomComparator is deprecated, use textMatcher instead.'), 'textCustomComparator.deprecated');
            return ({ filterOption, value, filterText }) => legacyComparator(filterOption, value, filterText);
        }
        return this.textFilterParams.textMatcher || TextFilter.DEFAULT_MATCHER;
    }
    createCondition(position) {
        const type = this.getConditionType(position);
        const model = {
            filterType: this.getFilterType(),
            type,
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
    getFilterType() {
        return 'text';
    }
    areSimpleModelsEqual(aSimple, bSimple) {
        return aSimple.filter === bSimple.filter &&
            aSimple.filterTo === bSimple.filterTo &&
            aSimple.type === bSimple.type;
    }
    getInputs(position) {
        if (position >= this.eValuesFrom.length) {
            return [null, null];
        }
        return [this.eValuesFrom[position], this.eValuesTo[position]];
    }
    getValues(position) {
        const result = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                const value = makeNull(element.getValue());
                const cleanValue = (this.textFilterParams.trimInput ? TextFilter.trimInput(value) : value) || null;
                result.push(cleanValue);
                element.setValue(cleanValue, true); // ensure clean value is visible
            }
        });
        return result;
    }
    getDefaultFilterOptions() {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }
    createValueElement() {
        const eCondition = document.createElement('div');
        eCondition.classList.add('ag-filter-body');
        setAriaRole(eCondition, 'presentation');
        this.createFromToElement(eCondition, this.eValuesFrom, 'from');
        this.createFromToElement(eCondition, this.eValuesTo, 'to');
        return eCondition;
    }
    createFromToElement(eCondition, eValues, fromTo) {
        const eValue = this.createManagedBean(new AgInputTextField());
        eValue.addCssClass(`ag-filter-${fromTo}`);
        eValue.addCssClass('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
    }
    removeValueElements(startPosition, deleteCount) {
        this.removeComponents(this.eValuesFrom, startPosition, deleteCount);
        this.removeComponents(this.eValuesTo, startPosition, deleteCount);
    }
    mapValuesFromModel(filterModel) {
        const { filter, filterTo, type } = filterModel || {};
        return [
            filter || null,
            filterTo || null,
        ].slice(0, this.getNumberOfInputs(type));
    }
    evaluateNullValue(filterType) {
        const filterTypesAllowNulls = [
            SimpleFilter.NOT_EQUAL, SimpleFilter.NOT_CONTAINS, SimpleFilter.BLANK,
        ];
        return filterType ? filterTypesAllowNulls.indexOf(filterType) >= 0 : false;
    }
    evaluateNonNullValue(values, cellValue, filterModel, params) {
        const formattedValues = values.map(v => this.formatter(v)) || [];
        const cellValueFormatted = this.formatter(cellValue);
        const { api, colDef, column, columnApi, context, textFormatter } = this.textFilterParams;
        if (filterModel.type === SimpleFilter.BLANK) {
            return this.isBlank(cellValue);
        }
        else if (filterModel.type === SimpleFilter.NOT_BLANK) {
            return !this.isBlank(cellValue);
        }
        const matcherParams = {
            api,
            colDef,
            column,
            columnApi,
            context,
            node: params.node,
            data: params.data,
            filterOption: filterModel.type,
            value: cellValueFormatted,
            textFormatter,
        };
        return formattedValues.some(v => this.matcher(Object.assign(Object.assign({}, matcherParams), { filterText: v })));
    }
    getModelAsString(model) {
        var _a;
        return (_a = this.filterModelFormatter.getModelAsString(model)) !== null && _a !== void 0 ? _a : '';
    }
}
TextFilter.DEFAULT_FILTER_OPTIONS = [
    SimpleFilter.CONTAINS,
    SimpleFilter.NOT_CONTAINS,
    SimpleFilter.EQUALS,
    SimpleFilter.NOT_EQUAL,
    SimpleFilter.STARTS_WITH,
    SimpleFilter.ENDS_WITH,
    SimpleFilter.BLANK,
    SimpleFilter.NOT_BLANK,
];
TextFilter.DEFAULT_FORMATTER = (from) => from;
TextFilter.DEFAULT_LOWERCASE_FORMATTER = (from) => from == null ? null : from.toString().toLowerCase();
TextFilter.DEFAULT_MATCHER = ({ filterOption, value, filterText }) => {
    if (filterText == null) {
        return false;
    }
    switch (filterOption) {
        case TextFilter.CONTAINS:
            return value.indexOf(filterText) >= 0;
        case TextFilter.NOT_CONTAINS:
            return value.indexOf(filterText) < 0;
        case TextFilter.EQUALS:
            return value === filterText;
        case TextFilter.NOT_EQUAL:
            return value != filterText;
        case TextFilter.STARTS_WITH:
            return value.indexOf(filterText) === 0;
        case TextFilter.ENDS_WITH:
            const index = value.lastIndexOf(filterText);
            return index >= 0 && index === (value.length - filterText.length);
        default:
            return false;
    }
};
