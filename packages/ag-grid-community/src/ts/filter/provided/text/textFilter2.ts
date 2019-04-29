import {FilterModel, IDoesFilterPassParams} from "../../../interfaces/iFilter";
import {RefSelector} from "../../../widgets/componentAnnotations";
import {_} from "../../../utils";
import {
    AbstractSimpleFilter,
    FilterPosition,
    IAbstractSimpleFilterParams,
    IAbstractSimpleModel
} from "../abstractSimpleFilter";

export interface TextFilterModel2 extends IAbstractSimpleModel {
    filter?: string;
}

export interface TextComparator2 {
    (filter: string, gridValue: any, filterText: string): boolean;
}

export interface TextFormatter2 {
    (from: string): string;
}

export interface ITextFilterParams2 extends IAbstractSimpleFilterParams {
    textCustomComparator?: TextComparator2;
    caseSensitive?: boolean;
}

export class TextFilter2 extends AbstractSimpleFilter<TextFilterModel2> {

    private static readonly FILTER_TYPE = 'text';

    public static DEFAULT_FILTER_OPTIONS = [AbstractSimpleFilter.EQUALS, AbstractSimpleFilter.NOT_EQUAL,
        AbstractSimpleFilter.STARTS_WITH, AbstractSimpleFilter.ENDS_WITH, AbstractSimpleFilter.CONTAINS,
        AbstractSimpleFilter.NOT_CONTAINS];

    static DEFAULT_FORMATTER: TextFormatter2 = (from: string) => {
        return from;
    };

    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter2 = (from: string) => {
        if (from == null) { return null; }
        return from.toString().toLowerCase();
    };

    static DEFAULT_COMPARATOR: TextComparator2 = (filter: string, value: any, filterText: string) => {
        switch (filter) {
            case TextFilter2.CONTAINS:
                return value.indexOf(filterText) >= 0;
            case TextFilter2.NOT_CONTAINS:
                return value.indexOf(filterText) === -1;
            case TextFilter2.EQUALS:
                return value === filterText;
            case TextFilter2.NOT_EQUAL:
                return value != filterText;
            case TextFilter2.STARTS_WITH:
                return value.indexOf(filterText) === 0;
            case TextFilter2.ENDS_WITH:
                const index = value.lastIndexOf(filterText);
                return index >= 0 && index === (value.length - filterText.length);
            default:
                // should never happen
                console.warn('invalid filter type ' + filter);
                return false;
        }
    };

    @RefSelector('eValue1')
    private eValue1: HTMLInputElement;

    @RefSelector('eValue2')
    private eValue2: HTMLInputElement;

    private comparator: TextComparator2;
    private formatter: TextFormatter2;

    private textFilterParams: ITextFilterParams2;

    private getValue(element: HTMLInputElement): string {
        let val = element.value;
        val = _.makeNull(val);
        if (val && val.trim() === '') {
            val = null;
        }
        if (val && !this.textFilterParams.caseSensitive) {
            val = val.toLowerCase();
        }
        return val;
    }

    private addValueChangedListeners(): void {
        const listener = this.onUiChangedListener.bind(this);
        this.addDestroyableEventListener(this.eValue1, 'input', listener);
        this.addDestroyableEventListener(this.eValue2, 'input', listener);
    }

    protected setParams(params: ITextFilterParams2): void {
        super.setParams(params);

        this.textFilterParams = params;
        this.comparator = this.textFilterParams.textCustomComparator ? this.textFilterParams.textCustomComparator : TextFilter2.DEFAULT_COMPARATOR;
        this.formatter =
            this.textFilterParams.textFormatter ? this.textFilterParams.textFormatter :
                this.textFilterParams.caseSensitive == true ? TextFilter2.DEFAULT_FORMATTER :
                    TextFilter2.DEFAULT_LOWERCASE_FORMATTER;

        this.addValueChangedListeners();
    }

    protected setConditionIntoUi(model: TextFilterModel2, position: FilterPosition): void {
        const positionOne = position===FilterPosition.One;

        const eValue = positionOne ? this.eValue1 : this.eValue2;

        eValue.value = model ? model.filter : null;
    }

    protected createCondition(position: FilterPosition): TextFilterModel2 {

        const positionOne = position===FilterPosition.One;

        const type = positionOne ? this.getType1() : this.getType2();
        const eValue = positionOne ? this.eValue1 : this.eValue2;
        const value = this.getValue(eValue);

        const model: TextFilterModel2 =  {
            filterType: TextFilter2.FILTER_TYPE,
            type: type
        };
        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;
        }
        return model;
    }

    protected getFilterType(): string {
        return TextFilter2.FILTER_TYPE;
    }

    protected areSimpleModelsEqual(aSimple: TextFilterModel2, bSimple: TextFilterModel2): boolean {
        return aSimple.filter === bSimple.filter && aSimple.type === bSimple.type;
    }

    protected resetUiToDefaults(): void {
        super.resetUiToDefaults();

        this.eValue1.value = null;
        this.eValue2.value = null;
    }

    protected setFloatingFilter(model: TextFilterModel2): void {
        if (model) {
            this.eValue1.value = model.filter;
        } else {
            this.eValue1.value = null;
        }
    }

    public getDefaultFilterOptions(): string[] {
        return TextFilter2.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: FilterPosition): string {

        const pos = position===FilterPosition.One ? '1' : '2';
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div class="ag-filter-body" ref="eCondition${pos}Body">
            <div class="ag-input-text-wrapper">
                <input class="ag-filter-filter" ref="eValue${pos}" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
            </div>
        </div>`;
    }

    protected updateUiVisibility(): void {
        super.updateUiVisibility();

        const show = (type: string, eValue: HTMLElement) => {
            const showValue = !this.doesFilterHaveHiddenInput(type) && type !== AbstractSimpleFilter.EMPTY;
            _.setVisible(eValue, showValue);
        };

        show(this.getType1(), this.eValue1);
        show(this.getType2(), this.eValue2);
    }

    public afterGuiAttached() {
        this.eValue1.focus();
    }

    protected isFilterUiComplete(position: FilterPosition): boolean {
        const positionOne = position===FilterPosition.One;

        const option = positionOne ? this.getType1() : this.getType2();
        const eFilterValue = positionOne ? this.eValue1 : this.eValue2;

        const value = this.getValue(eFilterValue);
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        return value != null;
    }

    public individualFilterPasses(params: IDoesFilterPassParams, filterModel: TextFilterModel2): boolean {

        const filterText:string =  filterModel.filter;
        const filterOption:string = filterModel.type;
        const cellValue = this.textFilterParams.valueGetter(params.node);
        const formattedCellValue = this.formatter(filterText);

        const customFilterOption = this.optionsFactory.getCustomOption(filterOption);
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterText != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterText, formattedCellValue);
            }
        }

        if (cellValue == null || cellValue === undefined) {
            return filterOption === AbstractSimpleFilter.NOT_EQUAL || filterOption === AbstractSimpleFilter.NOT_CONTAINS;
        }

        const valueFormatted: string = this.formatter(cellValue);
        return this.comparator(filterOption, valueFormatted, formattedCellValue);
    }

}