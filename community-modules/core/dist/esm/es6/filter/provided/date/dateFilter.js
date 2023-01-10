/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RefSelector } from '../../../widgets/componentAnnotations';
import { Autowired } from '../../../context/context';
import { DateCompWrapper } from './dateCompWrapper';
import { ConditionPosition } from '../simpleFilter';
import { ScalarFilter } from '../scalarFilter';
import { serialiseDate, parseDateTimeFromString } from '../../../utils/date';
const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;
export class DateFilter extends ScalarFilter {
    constructor() {
        super('dateFilter');
        this.minValidYear = DEFAULT_MIN_YEAR;
        this.maxValidYear = DEFAULT_MAX_YEAR;
    }
    afterGuiAttached(params) {
        super.afterGuiAttached(params);
        this.dateCondition1FromComp.afterGuiAttached(params);
    }
    mapValuesFromModel(filterModel) {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (because Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
        //       a date from the UI, it will have timezone info in it. This is lost when creating
        //       the model. When we recreate the date again here, it's without a timezone.
        const { dateFrom, dateTo, type } = filterModel || {};
        return [
            dateFrom && parseDateTimeFromString(dateFrom) || null,
            dateTo && parseDateTimeFromString(dateTo) || null,
        ].slice(0, this.getNumberOfInputs(type));
    }
    comparator() {
        return this.dateFilterParams.comparator ? this.dateFilterParams.comparator : this.defaultComparator.bind(this);
    }
    defaultComparator(filterDate, cellValue) {
        // The default comparator assumes that the cellValue is a date
        const cellAsDate = cellValue;
        if (cellValue == null || cellAsDate < filterDate) {
            return -1;
        }
        if (cellAsDate > filterDate) {
            return 1;
        }
        return 0;
    }
    setParams(params) {
        super.setParams(params);
        this.dateFilterParams = params;
        const yearParser = (param, fallback) => {
            if (params[param] != null) {
                if (!isNaN(params[param])) {
                    return params[param] == null ? fallback : Number(params[param]);
                }
                else {
                    console.warn(`AG Grid: DateFilter ${param} is not a number`);
                }
            }
            return fallback;
        };
        this.minValidYear = yearParser('minValidYear', DEFAULT_MIN_YEAR);
        this.maxValidYear = yearParser('maxValidYear', DEFAULT_MAX_YEAR);
        if (this.minValidYear > this.maxValidYear) {
            console.warn(`AG Grid: DateFilter minValidYear should be <= maxValidYear`);
        }
        this.createDateComponents();
    }
    createDateComponents() {
        const createDateCompWrapper = (element) => new DateCompWrapper(this.getContext(), this.userComponentFactory, {
            onDateChanged: () => this.onUiChanged(),
            filterParams: this.dateFilterParams
        }, element);
        this.dateCondition1FromComp = createDateCompWrapper(this.eCondition1PanelFrom);
        this.dateCondition1ToComp = createDateCompWrapper(this.eCondition1PanelTo);
        this.dateCondition2FromComp = createDateCompWrapper(this.eCondition2PanelFrom);
        this.dateCondition2ToComp = createDateCompWrapper(this.eCondition2PanelTo);
        this.addDestroyFunc(() => {
            this.forEachInput((element) => element.destroy());
        });
    }
    setElementValue(element, value, silent) {
        element.setDate(value);
    }
    setElementDisplayed(element, displayed) {
        element.setDisplayed(displayed);
    }
    setElementDisabled(element, disabled) {
        element.setDisabled(disabled);
    }
    getDefaultFilterOptions() {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }
    createValueTemplate(position) {
        const pos = position === ConditionPosition.One ? '1' : '2';
        return /* html */ `
            <div class="ag-filter-body" ref="eCondition${pos}Body">
                <div class="ag-filter-from ag-filter-date-from" ref="eCondition${pos}PanelFrom"></div>
                <div class="ag-filter-to ag-filter-date-to" ref="eCondition${pos}PanelTo"></div>
            </div>`;
    }
    isConditionUiComplete(position) {
        if (!super.isConditionUiComplete(position)) {
            return false;
        }
        const isValidDate = (value) => value != null
            && value.getUTCFullYear() >= this.minValidYear
            && value.getUTCFullYear() <= this.maxValidYear;
        let valid = true;
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (elPosition !== position || !valid || index >= numberOfInputs) {
                return;
            }
            valid = valid && isValidDate(element.getDate());
        });
        return valid;
    }
    areSimpleModelsEqual(aSimple, bSimple) {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
    }
    getFilterType() {
        return 'date';
    }
    createCondition(position) {
        const type = this.getConditionTypes()[position];
        const model = {};
        const values = this.getValues(position);
        if (values.length > 0) {
            model.dateFrom = serialiseDate(values[0]);
        }
        if (values.length > 1) {
            model.dateTo = serialiseDate(values[1]);
        }
        return Object.assign({ dateFrom: null, dateTo: null, filterType: this.getFilterType(), type }, model);
    }
    resetPlaceholder() {
        const globalTranslate = this.localeService.getLocaleTextFunc();
        const placeholder = this.translate('dateFormatOoo');
        const ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');
        this.forEachInput((element) => {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(ariaLabel);
        });
    }
    getInputs() {
        return [
            [this.dateCondition1FromComp, this.dateCondition1ToComp],
            [this.dateCondition2FromComp, this.dateCondition2ToComp],
        ];
    }
    getValues(position) {
        const result = [];
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (position === elPosition && index < numberOfInputs) {
                result.push(element.getDate());
            }
        });
        return result;
    }
}
DateFilter.DEFAULT_FILTER_OPTIONS = [
    ScalarFilter.EQUALS,
    ScalarFilter.GREATER_THAN,
    ScalarFilter.LESS_THAN,
    ScalarFilter.NOT_EQUAL,
    ScalarFilter.IN_RANGE,
    ScalarFilter.BLANK,
    ScalarFilter.NOT_BLANK,
];
__decorate([
    RefSelector('eCondition1PanelFrom')
], DateFilter.prototype, "eCondition1PanelFrom", void 0);
__decorate([
    RefSelector('eCondition1PanelTo')
], DateFilter.prototype, "eCondition1PanelTo", void 0);
__decorate([
    RefSelector('eCondition2PanelFrom')
], DateFilter.prototype, "eCondition2PanelFrom", void 0);
__decorate([
    RefSelector('eCondition2PanelTo')
], DateFilter.prototype, "eCondition2PanelTo", void 0);
__decorate([
    Autowired('userComponentFactory')
], DateFilter.prototype, "userComponentFactory", void 0);
