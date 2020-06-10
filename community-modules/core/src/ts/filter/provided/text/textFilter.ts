import { IDoesFilterPassParams } from '../../../interfaces/iFilter';
import { RefSelector } from '../../../widgets/componentAnnotations';
import {
    SimpleFilter,
    ConditionPosition,
    ISimpleFilterParams,
    ISimpleFilterModel
} from '../simpleFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { makeNull } from '../../../utils/generic';
import { setDisplayed } from '../../../utils/dom';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { Promise } from '../../../utils';
import { forEach } from '../../../utils/array';

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

    public static DEFAULT_FILTER_OPTIONS = [
        SimpleFilter.CONTAINS,
        SimpleFilter.NOT_CONTAINS,
        SimpleFilter.EQUALS,
        SimpleFilter.NOT_EQUAL,
        SimpleFilter.STARTS_WITH,
        SimpleFilter.ENDS_WITH
    ];

    static DEFAULT_FORMATTER: TextFormatter = (from: string) => from;

    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter = (from: string) =>
        from == null ? null : from.toString().toLowerCase();

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
    };

    @RefSelector('eValue1') private eValue1: AgInputTextField;
    @RefSelector('eValue2') private eValue2: AgInputTextField;

    private comparator: TextComparator;
    private formatter: TextFormatter;

    private textFilterParams: ITextFilterParams;

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    private getValue(inputField: AgInputTextField): string {
        let val = inputField.getValue();

        val = makeNull(val);

        if (val && val.trim() === '') {
            val = null;
        }

        return val;
    }

    private addValueChangedListeners(): void {
        const listener = () => this.onUiChanged();
        this.eValue1.onValueChange(listener);
        this.eValue2.onValueChange(listener);
    }

    protected setParams(params: ITextFilterParams): void {
        super.setParams(params);

        this.textFilterParams = params;
        this.comparator = this.textFilterParams.textCustomComparator || TextFilter.DEFAULT_COMPARATOR;
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive == true
                ? TextFilter.DEFAULT_FORMATTER
                : TextFilter.DEFAULT_LOWERCASE_FORMATTER);

        this.addValueChangedListeners();
    }

    protected setConditionIntoUi(model: TextFilterModel, position: ConditionPosition): void {
        const positionOne = position === ConditionPosition.One;
        const eValue = positionOne ? this.eValue1 : this.eValue2;

        eValue.setValue(model ? model.filter : null);
    }

    protected createCondition(position: ConditionPosition): TextFilterModel {
        const positionOne = position === ConditionPosition.One;
        const type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const eValue = positionOne ? this.eValue1 : this.eValue2;
        const value = this.getValue(eValue);
        const model: TextFilterModel = {
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

    protected resetUiToDefaults(silent?: boolean): Promise<void> {
        return super.resetUiToDefaults(silent).then(() => {
            this.forEachInput(field => field.setValue(null, silent));
            this.resetPlaceholder();
        });
    }

    private resetPlaceholder(): void {
        const placeholder = this.translate('filterOoo');

        this.forEachInput(field => field.setInputPlaceholder(placeholder));
    }

    private forEachInput(action: (field: AgInputTextField) => void): void {
        forEach([this.eValue1, this.eValue2], action);
    }

    protected setValueFromFloatingFilter(value: string): void {
        this.eValue1.setValue(value);
        this.eValue2.setValue(null);
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {
        const pos = position === ConditionPosition.One ? '1' : '2';

        return /* html */`
            <div class="ag-filter-body" ref="eCondition${pos}Body" role="presentation">
                <ag-input-text-field class="ag-filter-filter" ref="eValue${pos}"></ag-input-text-field>
            </div>`;
    }

    protected updateUiVisibility(): void {
        super.updateUiVisibility();

        const showValue1 = this.showValueFrom(this.getCondition1Type());
        setDisplayed(this.eValue1.getGui(), showValue1);

        const showValue2 = this.showValueFrom(this.getCondition2Type());
        setDisplayed(this.eValue2.getGui(), showValue2);
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams) {
        super.afterGuiAttached(params);

        this.resetPlaceholder();
        this.eValue1.getInputElement().focus();
    }

    protected isConditionUiComplete(position: ConditionPosition): boolean {
        const positionOne = position === ConditionPosition.One;
        const option = positionOne ? this.getCondition1Type() : this.getCondition2Type();

        if (option === SimpleFilter.EMPTY) { return false; }
        if (this.doesFilterHaveHiddenInput(option)) { return true; }

        return this.getValue(positionOne ? this.eValue1 : this.eValue2) != null;
    }

    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: TextFilterModel): boolean {
        const filterText = filterModel.filter;
        const filterOption = filterModel.type;
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

        const filterTextFormatted = this.formatter(filterText);

        return this.comparator(filterOption, cellValueFormatted, filterTextFormatted);
    }
}
