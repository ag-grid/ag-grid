/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const simpleFilter_1 = require("../simpleFilter");
const generic_1 = require("../../../utils/generic");
const utils_1 = require("../../../utils");
class TextFilter extends simpleFilter_1.SimpleFilter {
    constructor() {
        super('textFilter');
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
        super.setParams(params);
        this.textFilterParams = params;
        this.matcher = this.getTextMatcher();
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);
    }
    getTextMatcher() {
        const legacyComparator = this.textFilterParams.textCustomComparator;
        if (legacyComparator) {
            utils_1._.doOnce(() => console.warn('AG Grid - textCustomComparator is deprecated, use textMatcher instead.'), 'textCustomComparator.deprecated');
            return ({ filterOption, value, filterText }) => legacyComparator(filterOption, value, filterText);
        }
        return this.textFilterParams.textMatcher || TextFilter.DEFAULT_MATCHER;
    }
    createCondition(position) {
        const type = this.getConditionTypes()[position];
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
    getInputs() {
        return [
            [this.eValueFrom1, this.eValueTo1],
            [this.eValueFrom2, this.eValueTo2],
        ];
    }
    getValues(position) {
        const result = [];
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (position === elPosition && index < numberOfInputs) {
                const value = generic_1.makeNull(element.getValue());
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
    createValueTemplate(position) {
        const pos = position === simpleFilter_1.ConditionPosition.One ? '1' : '2';
        return /* html */ `
            <div class="ag-filter-body" ref="eCondition${pos}Body" role="presentation">
                <ag-input-text-field class=".ag-filter-from ag-filter-filter" ref="eValue-index0-${pos}"></ag-input-text-field>
                <ag-input-text-field class="ag-filter-to ag-filter-filter" ref="eValue-index1-${pos}"></ag-input-text-field>
            </div>`;
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
            simpleFilter_1.SimpleFilter.NOT_EQUAL, simpleFilter_1.SimpleFilter.NOT_CONTAINS, simpleFilter_1.SimpleFilter.BLANK,
        ];
        return filterType ? filterTypesAllowNulls.indexOf(filterType) >= 0 : false;
    }
    evaluateNonNullValue(values, cellValue, filterModel, params) {
        const formattedValues = values.map(v => this.formatter(v)) || [];
        const cellValueFormatted = this.formatter(cellValue);
        const { api, colDef, column, columnApi, context, textFormatter } = this.textFilterParams;
        if (filterModel.type === simpleFilter_1.SimpleFilter.BLANK) {
            return this.isBlank(cellValue);
        }
        else if (filterModel.type === simpleFilter_1.SimpleFilter.NOT_BLANK) {
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
}
TextFilter.DEFAULT_FILTER_OPTIONS = [
    simpleFilter_1.SimpleFilter.CONTAINS,
    simpleFilter_1.SimpleFilter.NOT_CONTAINS,
    simpleFilter_1.SimpleFilter.EQUALS,
    simpleFilter_1.SimpleFilter.NOT_EQUAL,
    simpleFilter_1.SimpleFilter.STARTS_WITH,
    simpleFilter_1.SimpleFilter.ENDS_WITH,
    simpleFilter_1.SimpleFilter.BLANK,
    simpleFilter_1.SimpleFilter.NOT_BLANK,
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
__decorate([
    componentAnnotations_1.RefSelector('eValue-index0-1')
], TextFilter.prototype, "eValueFrom1", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eValue-index1-1')
], TextFilter.prototype, "eValueTo1", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eValue-index0-2')
], TextFilter.prototype, "eValueFrom2", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eValue-index1-2')
], TextFilter.prototype, "eValueTo2", void 0);
exports.TextFilter = TextFilter;
