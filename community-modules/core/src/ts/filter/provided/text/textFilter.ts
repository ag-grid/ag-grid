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
import { AgPromise } from '../../../utils';
import { forEach } from '../../../utils/array';

export interface TextFilterModel extends ISimpleFilterModel {
    filter?: string | null;
}

export interface TextComparator {
    (filter: string | null | undefined, gridValue: any, filterText: string | null): boolean;
}

export interface TextFormatter {
    (from?: string | null): string | null;
}

export interface ITextFilterParams extends ISimpleFilterParams {
    textCustomComparator?: TextComparator;
    caseSensitive?: boolean;
    textFormatter?: (from: string) => string;
    trimInput?: boolean;
}

export class TextFilter extends SimpleFilter<TextFilterModel> {
    public static DEFAULT_FILTER_OPTIONS = [
        SimpleFilter.CONTAINS,
        SimpleFilter.NOT_CONTAINS,
        SimpleFilter.EQUALS,
        SimpleFilter.NOT_EQUAL,
        SimpleFilter.STARTS_WITH,
        SimpleFilter.ENDS_WITH
    ];

    static DEFAULT_FORMATTER: TextFormatter = (from: string) => from;

    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter = (from: string) => from == null ? null : from.toString().toLowerCase();

    static DEFAULT_COMPARATOR: TextComparator = (filter: string, value: any, filterText: string) => {
        switch (filter) {
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
                // should never happen
                console.warn('invalid filter type ' + filter);
                return false;
        }
    };

    @RefSelector('eValue1') private readonly eValue1: AgInputTextField;
    @RefSelector('eValue2') private readonly eValue2: AgInputTextField;

    private comparator: TextComparator;
    private formatter: TextFormatter;

    private textFilterParams: ITextFilterParams;

    constructor() {
        super('textFilter');
    }

    public static trimInput(value?: string | null): string | null | undefined {
        const trimmedInput = value && value.trim();

        // trim the input, unless it is all whitespace (this is consistent with Excel behaviour)
        return trimmedInput === '' ? value : trimmedInput;
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    private getCleanValue(inputField: AgInputTextField): string | null | undefined {
        const value = makeNull(inputField.getValue());

        return this.textFilterParams.trimInput ? TextFilter.trimInput(value) : value;
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
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);

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
        const value = this.getCleanValue(eValue);
        eValue.setValue(value, true); // ensure clean value is visible

        const model: TextFilterModel = {
            filterType: this.getFilterType(),
            type
        };

        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;
        }

        return model;
    }

    protected getFilterType(): string {
        return 'text';
    }

    protected areSimpleModelsEqual(aSimple: TextFilterModel, bSimple: TextFilterModel): boolean {
        return aSimple.filter === bSimple.filter && aSimple.type === bSimple.type;
    }

    protected resetUiToDefaults(silent?: boolean): AgPromise<void> {
        return super.resetUiToDefaults(silent).then(() => {
            this.forEachInput(field => field.setValue(null, silent));
            this.resetPlaceholder();
        });
    }

    private resetPlaceholder(): void {
        const globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        const placeholder = this.translate('filterOoo');

        this.forEachInput(field => {
            field.setInputPlaceholder(placeholder);
            field.setInputAriaLabel(globalTranslate('ariaFilterValue', 'Filter Value'));
        });
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

        setDisplayed(this.eCondition1Body, this.showValueFrom(this.getCondition1Type()));
        setDisplayed(this.eCondition2Body, this.isCondition2Enabled() && this.showValueFrom(this.getCondition2Type()));
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams) {
        super.afterGuiAttached(params);

        this.resetPlaceholder();

        if (!params || !params.suppressFocus) {
            this.eValue1.getInputElement().focus();
        }
    }

    protected isConditionUiComplete(position: ConditionPosition): boolean {
        const positionOne = position === ConditionPosition.One;
        const option = positionOne ? this.getCondition1Type() : this.getCondition2Type();

        if (option === SimpleFilter.EMPTY) { return false; }
        if (this.doesFilterHaveHiddenInput(option)) { return true; }

        return this.getCleanValue(positionOne ? this.eValue1 : this.eValue2) != null;
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
