/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
const scalarFilter_1 = require("../scalarFilter");
const generic_1 = require("../../../utils/generic");
const browser_1 = require("../../../utils/browser");
class NumberFilter extends scalarFilter_1.ScalarFilter {
    constructor() {
        super('numberFilter');
    }
    mapValuesFromModel(filterModel) {
        const { filter, filterTo, type } = filterModel || {};
        return [
            filter == null ? null : filter,
            filterTo == null ? null : filterTo,
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
        const allowedCharPattern = this.getAllowedCharPattern();
        if (allowedCharPattern) {
            const config = { allowedCharPattern };
            this.resetTemplate({
                'eValue-index0-1': config,
                'eValue-index1-1': config,
                'eValue-index0-2': config,
                'eValue-index1-2': config,
            });
        }
        super.setParams(params);
    }
    getDefaultFilterOptions() {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
    createValueTemplate(position) {
        const pos = position === simpleFilter_1.ConditionPosition.One ? '1' : '2';
        const allowedCharPattern = this.getAllowedCharPattern();
        const agElementTag = allowedCharPattern ? 'ag-input-text-field' : 'ag-input-number-field';
        return /* html */ `
            <div class="ag-filter-body" ref="eCondition${pos}Body" role="presentation">
                <${agElementTag} class="ag-filter-from ag-filter-filter" ref="eValue-index0-${pos}"></${agElementTag}>
                <${agElementTag} class="ag-filter-to ag-filter-filter" ref="eValue-index1-${pos}"></${agElementTag}>
            </div>`;
    }
    getValues(position) {
        const result = [];
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (position === elPosition && index < numberOfInputs) {
                result.push(this.stringToFloat(element.getValue()));
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
    stringToFloat(value) {
        if (typeof value === 'number') {
            return value;
        }
        let filterText = generic_1.makeNull(value);
        if (filterText != null && filterText.trim() === '') {
            filterText = null;
        }
        if (this.numberFilterParams.numberParser) {
            return this.numberFilterParams.numberParser(filterText);
        }
        return filterText == null || filterText.trim() === '-' ? null : parseFloat(filterText);
    }
    createCondition(position) {
        const type = this.getConditionTypes()[position];
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
    getInputs() {
        return [
            [this.eValueFrom1, this.eValueTo1],
            [this.eValueFrom2, this.eValueTo2],
        ];
    }
    getAllowedCharPattern() {
        const { allowedCharPattern } = this.numberFilterParams || {};
        if (allowedCharPattern) {
            return allowedCharPattern;
        }
        if (!browser_1.isBrowserChrome() && !browser_1.isBrowserEdge()) {
            // only Chrome and Edge support the HTML5 number field, so for other browsers we provide an equivalent
            // constraint instead
            return '\\d\\-\\.';
        }
        return null;
    }
}
NumberFilter.DEFAULT_FILTER_OPTIONS = [
    scalarFilter_1.ScalarFilter.EQUALS,
    scalarFilter_1.ScalarFilter.NOT_EQUAL,
    scalarFilter_1.ScalarFilter.LESS_THAN,
    scalarFilter_1.ScalarFilter.LESS_THAN_OR_EQUAL,
    scalarFilter_1.ScalarFilter.GREATER_THAN,
    scalarFilter_1.ScalarFilter.GREATER_THAN_OR_EQUAL,
    scalarFilter_1.ScalarFilter.IN_RANGE,
    scalarFilter_1.ScalarFilter.BLANK,
    scalarFilter_1.ScalarFilter.NOT_BLANK,
];
__decorate([
    componentAnnotations_1.RefSelector('eValue-index0-1')
], NumberFilter.prototype, "eValueFrom1", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eValue-index1-1')
], NumberFilter.prototype, "eValueTo1", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eValue-index0-2')
], NumberFilter.prototype, "eValueFrom2", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eValue-index1-2')
], NumberFilter.prototype, "eValueTo2", void 0);
exports.NumberFilter = NumberFilter;
