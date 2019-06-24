import { IDoesFilterPassParams } from "../../../interfaces/iFilter";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { _ } from "../../../utils";
import {
    SimpleFilter,
    ConditionPosition,
    ISimpleFilterParams,
    ISimpleFilterModel
} from "../simpleFilter";

export interface TextFilterModel extends ISimpleFilterModel {
    filter?: string;
}

export interface TextComparator {
    (filter: string, gridValue: any, filterText: string): boolean;
}

export interface TextFormatter {
    (from: string): string;
}

export interface ITextFilterParams extends ISimpleFilterParams {
    textCustomComparator?: TextComparator;
    caseSensitive?: boolean;
    textFormatter?: (from: string) => string;
}

export class TextFilter extends SimpleFilter<TextFilterModel> {

    private static readonly FILTER_TYPE = 'text';

    public static DEFAULT_FILTER_OPTIONS = [SimpleFilter.CONTAINS, SimpleFilter.NOT_CONTAINS,
        SimpleFilter.EQUALS, SimpleFilter.NOT_EQUAL,
        SimpleFilter.STARTS_WITH, SimpleFilter.ENDS_WITH];

    static DEFAULT_FORMATTER: TextFormatter = (from: string) => {
        return from;
    }

    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter = (from: string) => {
        if (from == null) { return null; }
        return from.toString().toLowerCase();
    }

    static DEFAULT_COMPARATOR: TextComparator = (filter: string, value: any, filterText: string) => {
        switch (filter) {
            case TextFilter.CONTAINS:
                return value.indexOf(filterText) >= 0;
            case TextFilter.NOT_CONTAINS:
                return value.indexOf(filterText) === -1;
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
                // should never happen
                console.warn('invalid filter type ' + filter);
                return false;
        }
    }

    @RefSelector('eValue1')
    private eValue1: HTMLInputElement;

    @RefSelector('eValue2')
    private eValue2: HTMLInputElement;

    @RefSelector('eInputWrapper1')
    private eInputWrapper1: HTMLElement;

    @RefSelector('eInputWrapper2')
    private eInputWrapper2: HTMLElement;

    private comparator: TextComparator;
    private formatter: TextFormatter;

    private textFilterParams: ITextFilterParams;

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    private getValue(element: HTMLInputElement): string {
        let val = element.value;
        val = _.makeNull(val);
        if (val && val.trim() === '') {
            val = null;
        }
        return val;
    }

    private addValueChangedListeners(): void {
        const listener = () => this.onUiChanged();
        this.addDestroyableEventListener(this.eValue1, 'input', listener);
        this.addDestroyableEventListener(this.eValue2, 'input', listener);
    }

    protected setParams(params: ITextFilterParams): void {
        super.setParams(params);

        this.textFilterParams = params;
        this.comparator = this.textFilterParams.textCustomComparator ? this.textFilterParams.textCustomComparator : TextFilter.DEFAULT_COMPARATOR;
        this.formatter =
            this.textFilterParams.textFormatter ? this.textFilterParams.textFormatter :
                this.textFilterParams.caseSensitive == true ? TextFilter.DEFAULT_FORMATTER :
                    TextFilter.DEFAULT_LOWERCASE_FORMATTER;

        this.addValueChangedListeners();
    }

    protected setConditionIntoUi(model: TextFilterModel, position: ConditionPosition): void {
        const positionOne = position === ConditionPosition.One;

        const eValue = positionOne ? this.eValue1 : this.eValue2;

        eValue.value = model ? model.filter : null;
    }

    protected createCondition(position: ConditionPosition): TextFilterModel {

        const positionOne = position === ConditionPosition.One;

        const type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const eValue = positionOne ? this.eValue1 : this.eValue2;
        const value = this.getValue(eValue);

        const model: TextFilterModel =  {
            filterType: TextFilter.FILTER_TYPE,
            type: type
        };
        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;
        }
        return model;
    }

    protected getFilterType(): string {
        return TextFilter.FILTER_TYPE;
    }

    protected areSimpleModelsEqual(aSimple: TextFilterModel, bSimple: TextFilterModel): boolean {
        return aSimple.filter === bSimple.filter && aSimple.type === bSimple.type;
    }

    protected resetUiToDefaults(): void {
        super.resetUiToDefaults();

        this.eValue1.value = null;
        this.eValue2.value = null;
    }

    protected setValueFromFloatingFilter(value: string): void {
        this.eValue1.value = value;
        this.eValue2.value = null;
    }

    public getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {

        const pos = position === ConditionPosition.One ? '1' : '2';
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div class="ag-filter-body" ref="eCondition${pos}Body">
            <div class="ag-input-wrapper" ref="eInputWrapper${pos}">
                <input class="ag-filter-filter" ref="eValue${pos}" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
            </div>
        </div>`;
    }

    protected updateUiVisibility(): void {
        super.updateUiVisibility();

        const showValue1 = this.showValueFrom(this.getCondition1Type());
        _.setVisible(this.eInputWrapper1, showValue1);
        const showValue2 = this.showValueFrom(this.getCondition2Type());
        _.setVisible(this.eInputWrapper2, showValue2);
    }

    public afterGuiAttached() {
        this.eValue1.focus();
    }

    protected isConditionUiComplete(position: ConditionPosition): boolean {
        const positionOne = position === ConditionPosition.One;

        const option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const eFilterValue = positionOne ? this.eValue1 : this.eValue2;

        if (option === SimpleFilter.EMPTY) { return false; }

        const value = this.getValue(eFilterValue);
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }

        return value != null;
    }

    public individualConditionPasses(params: IDoesFilterPassParams, filterModel: TextFilterModel): boolean {

        const filterText:string =  filterModel.filter;
        const filterOption:string = filterModel.type;
        const cellValue = this.textFilterParams.valueGetter(params.node);
        const cellValueFormatted = this.formatter(cellValue);

        const customFilterOption = this.optionsFactory.getCustomOption(filterOption);
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterText != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterText, cellValueFormatted);
            }
        }

        if (cellValue == null) {
            return filterOption === SimpleFilter.NOT_EQUAL || filterOption === SimpleFilter.NOT_CONTAINS;
        }

        const filterTextFormatted: string = this.formatter(filterText);
        return this.comparator(filterOption, cellValueFormatted, filterTextFormatted);
    }

}