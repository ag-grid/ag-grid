import { IDoesFilterPassParams, IFilterOptionDef, IFilterParams, ProvidedFilterModel } from '../../interfaces/iFilter';
import { RefSelector } from '../../widgets/componentAnnotations';
import { OptionsFactory } from './optionsFactory';
import { IProvidedFilter, IProvidedFilterParams, ProvidedFilter } from './providedFilter';
import { AgPromise } from '../../utils';
import { AgSelect } from '../../widgets/agSelect';
import { AgRadioButton } from '../../widgets/agRadioButton';
import { includes } from '../../utils/array';
import { setDisplayed, setDisabled } from '../../utils/dom';
import { IFilterLocaleText } from '../filterLocaleText';
import { AgInputTextField } from '../../widgets/agInputTextField';
import { Component } from '../../widgets/component';
import { AgAbstractInputField } from '../../widgets/agAbstractInputField';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { ListOption } from '../../widgets/agList';
import { IFloatingFilterParent } from '../floating/floatingFilter';
import { isFunction } from '../../utils/function';

export type JoinOperator = 'AND' | 'OR';

/** Interface contract for the public aspects of the SimpleFilter implementation(s). */
export interface ISimpleFilter extends IProvidedFilter, IFloatingFilterParent {
}

export interface IFilterPlaceholderFunctionParams {
    /**
     * The filter option key
     */
    filterOptionKey: ISimpleFilterModelType,
    /**
     * The filter option name as localised text
     */
    filterOption: string,
    /**
     * The default placeholder text
     */
    placeholder: string
}
export type FilterPlaceholderFunction = (params: IFilterPlaceholderFunctionParams) => string;

/**
 * Parameters provided by the grid to the `init` method of a `SimpleFilter`.
 * Do not use in `colDef.filterParams` - see `ISimpleFilterParams` instead.
 */
export type SimpleFilterParams<TData = any> = ISimpleFilterParams & IFilterParams<TData>;

/**
 * Common parameters in `colDef.filterParams` used by all simple filters. Extended by the specific filter types.
 */
export interface ISimpleFilterParams extends IProvidedFilterParams {
    /**
     * Array of filter options to present to the user.
     */
    filterOptions?: (IFilterOptionDef | ISimpleFilterModelType)[];
    /** The default filter option to be selected. */
    defaultOption?: string;
    /**
     * By default, the two conditions are combined using `AND`.
     * You can change this default by setting this property.
     * Options: `AND`, `OR`
     */
    defaultJoinOperator?: JoinOperator;
    /**
     * If `true`, the filter will only allow one condition.
     * Default: `false`
     */
    suppressAndOrCondition?: boolean;
    /**
     * By default, only one condition is shown, and a second is made visible once a first condition has been entered.
     * Set this to `true` to always show both conditions.
     * In this case the second condition will be disabled until a first condition has been entered.
     * Default: `false`
     */
    alwaysShowBothConditions?: boolean;

    /**
     * Placeholder text for the filter textbox
     */
    filterPlaceholder?: FilterPlaceholderFunction | string;
}

export type ISimpleFilterModelType =
    'empty'
    | 'equals'
    | 'notEqual'
    | 'lessThan'
    | 'lessThanOrEqual'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'inRange'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith'
    | 'blank'
    | 'notBlank';
export interface ISimpleFilterModel extends ProvidedFilterModel {
    /** One of the filter options, e.g. `'equals'` */
    type?: ISimpleFilterModelType | null;
}

export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: JoinOperator;
    condition1: M;
    condition2: M;
}

export enum ConditionPosition { One, Two }

export type Tuple<T> = (T | null)[];

/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 * @param E type of UI element used for collecting user-input
 */
export abstract class SimpleFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends ProvidedFilter<M | ICombinedSimpleModel<M>, V> implements ISimpleFilter {

    public static EMPTY: ISimpleFilterModelType = 'empty';
    public static BLANK: ISimpleFilterModelType = 'blank';
    public static NOT_BLANK: ISimpleFilterModelType = 'notBlank';
    public static EQUALS: ISimpleFilterModelType = 'equals';
    public static NOT_EQUAL: ISimpleFilterModelType = 'notEqual';
    public static LESS_THAN: ISimpleFilterModelType = 'lessThan';
    public static LESS_THAN_OR_EQUAL: ISimpleFilterModelType = 'lessThanOrEqual';
    public static GREATER_THAN: ISimpleFilterModelType = 'greaterThan';
    public static GREATER_THAN_OR_EQUAL: ISimpleFilterModelType = 'greaterThanOrEqual';
    public static IN_RANGE: ISimpleFilterModelType = 'inRange';
    public static CONTAINS: ISimpleFilterModelType = 'contains';
    public static NOT_CONTAINS: ISimpleFilterModelType = 'notContains';
    public static STARTS_WITH: ISimpleFilterModelType = 'startsWith';
    public static ENDS_WITH: ISimpleFilterModelType = 'endsWith';

    @RefSelector('eOptions1') protected readonly eType1: AgSelect;
    @RefSelector('eOptions2') protected readonly eType2: AgSelect;
    @RefSelector('eJoinOperatorPanel') protected readonly eJoinOperatorPanel: HTMLElement;
    @RefSelector('eJoinOperatorAnd') protected readonly eJoinOperatorAnd: AgRadioButton;
    @RefSelector('eJoinOperatorOr') protected readonly eJoinOperatorOr: AgRadioButton;
    @RefSelector('eCondition1Body') protected readonly eCondition1Body: HTMLElement;
    @RefSelector('eCondition2Body') protected readonly eCondition2Body: HTMLElement;

    private allowTwoConditions: boolean;
    private alwaysShowBothConditions: boolean;
    private defaultJoinOperator: JoinOperator | undefined;
    private filterPlaceholder: SimpleFilterParams['filterPlaceholder'];

    protected optionsFactory: OptionsFactory;
    protected abstract getDefaultFilterOptions(): string[];

    // gets called once during initialisation, to build up the html template
    protected abstract createValueTemplate(position: ConditionPosition): string;

    // filter uses this to know if new model is different from previous model, ie if filter has changed
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;

    // getModel() calls this to create the two conditions. if only one condition,
    // the result is returned by getModel(), otherwise is called twice and both results
    // returned in a CombinedFilter object.
    protected abstract createCondition(position: ConditionPosition): M;

    // because the sub-class filter models have different attribute names, we have to map
    protected abstract mapValuesFromModel(filterModel: ISimpleFilterModel | null): Tuple<V>;

    // allow value-type specific handling of null cell values.
    protected abstract evaluateNullValue(filterType?: ISimpleFilterModelType | null): boolean;

    // allow value-type specific handling of non-null cell values.
    protected abstract evaluateNonNullValue(range: Tuple<V>, cellValue: V, filterModel: M, params: IDoesFilterPassParams): boolean;

    // allow iteration of all condition inputs managed by sub-classes.
    protected abstract getInputs(): Tuple<E>[];

    // allow retrieval of all condition input values.
    protected abstract getValues(position: ConditionPosition): Tuple<V>;

    protected getNumberOfInputs(type?: ISimpleFilterModelType | null): number {
        const customOpts = this.optionsFactory.getCustomOption(type);
        if (customOpts) {
            const { numberOfInputs } = customOpts;
            return numberOfInputs != null ? numberOfInputs : 1;
        }

        const zeroInputTypes = [
            SimpleFilter.EMPTY, SimpleFilter.NOT_BLANK, SimpleFilter.BLANK,
        ];

        if (type && zeroInputTypes.indexOf(type) >= 0) {
            return 0;
        } else if (type === SimpleFilter.IN_RANGE) {
            return 2;
        }

        return 1;
    }

    // floating filter calls this when user applies filter from floating filter
    public onFloatingFilterChanged(type: string | null | undefined, value: V | null): void {
        this.setTypeFromFloatingFilter(type);
        this.setValueFromFloatingFilter(value);
        this.onUiChanged(true);
    }

    protected setTypeFromFloatingFilter(type?: string | null): void {
        this.eType1.setValue(type);
        this.eType2.setValue(this.optionsFactory.getDefaultOption());
        (this.isDefaultOperator('AND') ? this.eJoinOperatorAnd : this.eJoinOperatorOr).setValue(true);
    }

    public getModelFromUi(): M | ICombinedSimpleModel<M> | null {
        if (!this.isConditionUiComplete(ConditionPosition.One)) {
            return null;
        }

        if (this.isAllowTwoConditions() && this.isConditionUiComplete(ConditionPosition.Two)) {
            return {
                filterType: this.getFilterType(),
                operator: this.getJoinOperator(),
                condition1: this.createCondition(ConditionPosition.One),
                condition2: this.createCondition(ConditionPosition.Two)
            };
        }

        return this.createCondition(ConditionPosition.One);
    }

    protected getConditionTypes(): Tuple<ISimpleFilterModelType> {
        return [
            this.eType1.getValue() as ISimpleFilterModelType,
            this.eType2.getValue() as ISimpleFilterModelType,
        ];
    }

    protected getJoinOperator(): JoinOperator {
        return this.eJoinOperatorOr.getValue() === true ? 'OR' : 'AND';
    }

    protected areModelsEqual(a: M | ICombinedSimpleModel<M>, b: M | ICombinedSimpleModel<M>): boolean {
        // both are missing
        if (!a && !b) { return true; }

        // one is missing, other present
        if ((!a && b) || (a && !b)) { return false; }

        // one is combined, the other is not
        const aIsSimple = !(a as any).operator;
        const bIsSimple = !(b as any).operator;
        const oneSimpleOneCombined = (!aIsSimple && bIsSimple) || (aIsSimple && !bIsSimple);
        if (oneSimpleOneCombined) { return false; }

        let res: boolean;

        // otherwise both present, so compare
        if (aIsSimple) {
            const aSimple = a as M;
            const bSimple = b as M;

            res = this.areSimpleModelsEqual(aSimple, bSimple);
        } else {
            const aCombined = a as ICombinedSimpleModel<M>;
            const bCombined = b as ICombinedSimpleModel<M>;

            res = aCombined.operator === bCombined.operator
                && this.areSimpleModelsEqual(aCombined.condition1, bCombined.condition1)
                && this.areSimpleModelsEqual(aCombined.condition2, bCombined.condition2);
        }

        return res;
    }

    protected setModelIntoUi(model: ISimpleFilterModel | ICombinedSimpleModel<M>): AgPromise<void> {
        const isCombined = (model as any).operator;

        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<M>;

            const orChecked = combinedModel.operator === 'OR';
            this.eJoinOperatorAnd.setValue(!orChecked);
            this.eJoinOperatorOr.setValue(orChecked);

            this.eType1.setValue(combinedModel.condition1.type);
            this.eType2.setValue(combinedModel.condition2.type);

            this.setConditionIntoUi(combinedModel.condition1, ConditionPosition.One);
            this.setConditionIntoUi(combinedModel.condition2, ConditionPosition.Two);
        } else {
            const simpleModel = model as ISimpleFilterModel;

            this.eJoinOperatorAnd.setValue(this.isDefaultOperator('AND'));
            this.eJoinOperatorOr.setValue(this.isDefaultOperator('OR'));

            this.eType1.setValue(simpleModel.type);
            this.eType2.setValue(this.optionsFactory.getDefaultOption());

            this.setConditionIntoUi(simpleModel as M, ConditionPosition.One);
            this.setConditionIntoUi(null, ConditionPosition.Two);
        }

        return AgPromise.resolve();
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const model = this.getModel();

        if (model == null) { return true; }

        const { operator } = model as ICombinedSimpleModel<M>;
        const models: M[] = [];

        if (operator) {
            const combinedModel = model as ICombinedSimpleModel<M>;

            models.push(combinedModel.condition1, combinedModel.condition2);
        } else {
            models.push(model as M);
        }

        const combineFunction = operator && operator === 'OR' ? 'some' : 'every';

        return models[combineFunction](m => this.individualConditionPasses(params, m));
    }

    protected setParams(params: SimpleFilterParams): void {
        super.setParams(params);

        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());

        this.allowTwoConditions = !params.suppressAndOrCondition;
        this.alwaysShowBothConditions = !!params.alwaysShowBothConditions;
        this.defaultJoinOperator = this.getDefaultJoinOperator(params.defaultJoinOperator);
        this.filterPlaceholder = params.filterPlaceholder;

        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    }

    private getDefaultJoinOperator(defaultJoinOperator?: JoinOperator): JoinOperator | undefined {
        return includes(['AND', 'OR'], defaultJoinOperator) ? defaultJoinOperator : 'AND';
    }

    private putOptionsIntoDropdown(): void {
        const filterOptions = this.optionsFactory.getFilterOptions();
        const eTypes = [this.eType1, this.eType2];

        // Add specified options to all condition drop-downs.
        filterOptions.forEach(option => {
            const listOption = typeof option === 'string' ?
                this.createBoilerplateListOption(option) :
                this.createCustomListOption(option);

            eTypes.forEach(eType => eType.addOption(listOption));
        });

        // Make drop-downs read-only if there is only one option.
        eTypes.forEach(eType => eType.setDisabled(filterOptions.length <= 1));
    }

    private createBoilerplateListOption(option: string): ListOption {
        return { value: option, text: this.translate(option as keyof IFilterLocaleText) };
    }

    private createCustomListOption(option: IFilterOptionDef): ListOption {
        const { displayKey } = option;
        const customOption = this.optionsFactory.getCustomOption(option.displayKey);
        return {
            value: displayKey,
            text: customOption ?
                this.localeService.getLocaleTextFunc()(customOption.displayKey, customOption.displayName) :
                this.translate(displayKey as keyof IFilterLocaleText),
        };
    }

    public isAllowTwoConditions(): boolean {
        return this.allowTwoConditions;
    }

    protected createBodyTemplate(): string {
        return /* html */`
            <ag-select class="ag-filter-select" ref="eOptions1"></ag-select>
            ${this.createValueTemplate(ConditionPosition.One)}
            <div class="ag-filter-condition" ref="eJoinOperatorPanel">
               <ag-radio-button ref="eJoinOperatorAnd" class="ag-filter-condition-operator ag-filter-condition-operator-and"></ag-radio-button>
               <ag-radio-button ref="eJoinOperatorOr" class="ag-filter-condition-operator ag-filter-condition-operator-or"></ag-radio-button>
            </div>
            <ag-select class="ag-filter-select" ref="eOptions2"></ag-select>
            ${this.createValueTemplate(ConditionPosition.Two)}`;
    }

    protected getCssIdentifier() {
        return 'simple-filter';
    }

    protected updateUiVisibility(): void {
        const elementConditionGroups = [
            [this.eType1],
            [this.eType2, this.eJoinOperatorPanel, this.eJoinOperatorAnd, this.eJoinOperatorOr],
        ];
        const elementBodies = [this.eCondition1Body, this.eCondition2Body];

        elementConditionGroups.forEach((group, position) => {
            const visible = this.isConditionVisible(position);
            const disabled = this.isConditionDisabled(position);

            group.forEach(element => {
                if (element instanceof AgAbstractInputField || element instanceof AgSelect) {
                    element.setDisabled(disabled);
                    element.setDisplayed(visible);
                } else {
                    setDisabled(element, disabled);
                    setDisplayed(element, visible);
                }
            });
        });

        elementBodies.forEach((element, index) => {
            setDisplayed(element, this.isConditionBodyVisible(index));
        });

        this.forEachInput((element, index, position, numberOfInputs) => {
            this.setElementDisplayed(element, index < numberOfInputs);
            this.setElementDisabled(element, this.isConditionDisabled(position));
        });

        this.resetPlaceholder();
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams) {
        super.afterGuiAttached(params);

        this.resetPlaceholder();

        if (!params || (!params.suppressFocus && !this.isReadOnly())) {
            const firstInput = this.getInputs()[0][0];
            if (!firstInput) { return; }

            if (firstInput instanceof AgAbstractInputField) {
                firstInput.getInputElement().focus();
            }
        }
    }

    private getPlaceholderText(defaultPlaceholder: keyof IFilterLocaleText, position: number): string {
        let placeholder = this.translate(defaultPlaceholder);
        if (isFunction(this.filterPlaceholder)) {
            const filterPlaceholderFn = this.filterPlaceholder as FilterPlaceholderFunction;
            const filterOptionKey = (position === 0 ? this.eType1.getValue() : this.eType2.getValue()) as ISimpleFilterModelType;
            const filterOption = this.translate(filterOptionKey);
            placeholder = filterPlaceholderFn({
                filterOptionKey,
                filterOption,
                placeholder
            });
        } else if (typeof this.filterPlaceholder === 'string') {
            placeholder = this.filterPlaceholder;
        }

        return placeholder;
    }

    // allow sub-classes to reset HTML placeholders after UI update.
    protected resetPlaceholder(): void {
        const globalTranslate = this.localeService.getLocaleTextFunc();

        this.forEachInput((element, index, position, numberOfInputs) => {
            if (!(element instanceof AgAbstractInputField)) {
                return;
            }

            const placeholder =
                index === 0 && numberOfInputs > 1 ? 'inRangeStart' :
                index === 0 ? 'filterOoo' :
                'inRangeEnd';
            const ariaLabel =
                index === 0 && numberOfInputs > 1 ? globalTranslate('ariaFilterFromValue', 'Filter from value') :
                index === 0 ? globalTranslate('ariaFilterValue', 'Filter Value') :
                globalTranslate('ariaFilterToValue', 'Filter to Value');

            element.setInputPlaceholder(this.getPlaceholderText(placeholder, position));
            element.setInputAriaLabel(ariaLabel);
        });
    }

    protected setElementValue(element: E, value: V | null, silent?: boolean): void {
        if (element instanceof AgAbstractInputField) {
            element.setValue(value != null ? String(value) : null, silent);
        }
    }

    protected setElementDisplayed(element: E, displayed: boolean): void {
        if (element instanceof Component) {
            setDisplayed(element.getGui(), displayed);
        }
    }

    protected setElementDisabled(element: E, disabled: boolean): void {
        if (element instanceof Component) {
            setDisabled(element.getGui(), disabled);
        }
    }

    protected attachElementOnChange(element: E, listener: () => void): void {
        if (element instanceof AgAbstractInputField) {
            element.onValueChange(listener);
        }
    }

    protected forEachInput(cb: (element: E, index: number, position: number, numberOfInputs: number) => void): void {
        const inputs = this.getInputs();
        this.getConditionTypes().forEach((type, position) => {
            const numberOfInputs = this.getNumberOfInputs(type);
            for (let index = 0; index < inputs[position].length; index++) {
                const input = inputs[position][index];
                if (input != null) {
                    cb(input, index, position, numberOfInputs);
                }
            }
        });
    }

    protected isConditionVisible(position: ConditionPosition): boolean {
        if (position === 0) { return true; } // Position 0 should always be visible.
        if (!this.allowTwoConditions) { return false; } // Short-circuit if no tail conditions.

        if (this.isReadOnly()) {
            // Only display a condition when read-only if the condition is complete.
            return this.isConditionUiComplete(position);
        }

        if (this.alwaysShowBothConditions) { return true; }

        // Only display a 2nd or later condition when the previous condition is complete.
        return this.isConditionUiComplete(position - 1);
    }

    protected isConditionDisabled(position: ConditionPosition): boolean {
        if (this.isReadOnly()) { return true; } // Read-only mode trumps everything.
        if (!this.isConditionVisible(position)) { return true; } // Invisible implies disabled.
        if (position === 0) { return false; } // Position 0 should typically be editable.

        // Only allow editing of a 2nd or later condition if the previous condition is complete.
        return !this.isConditionUiComplete(position - 1);
    }

    protected isConditionBodyVisible(position: ConditionPosition): boolean {
        if (!this.isConditionVisible(position)) { return false; }

        // Check that the condition needs inputs.
        const type = this.getConditionTypes()[position];
        const numberOfInputs = this.getNumberOfInputs(type);
        return numberOfInputs > 0;
    }

    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    protected isConditionUiComplete(position: ConditionPosition): boolean {
        const type = this.getConditionTypes()[position];

        if (type === SimpleFilter.EMPTY) { return false; }

        if (this.getValues(position).some(v => v == null)) {
            return false;
        }

        return true;
    }

    protected resetUiToDefaults(silent?: boolean): AgPromise<void> {
        const translate = this.localeService.getLocaleTextFunc();
        const filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        const uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        const defaultOption = this.optionsFactory.getDefaultOption();

        this.eType1
            .setValue(defaultOption, silent)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly());
        this.eType2
            .setValue(this.optionsFactory.getDefaultOption(), silent)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly());

        this.eJoinOperatorAnd
            .setValue(this.isDefaultOperator('AND'), silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('andCondition'))
            .setDisabled(this.isReadOnly());

        this.eJoinOperatorOr
            .setValue(this.isDefaultOperator('OR'), silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('orCondition'))
            .setDisabled(this.isReadOnly());

        this.forEachInput((element) => {
            this.setElementValue(element, null, silent);
            this.setElementDisabled(element, this.isReadOnly());
        });

        this.resetPlaceholder();

        return AgPromise.resolve();
    }

    // puts model values into the UI
    protected setConditionIntoUi(model: M | null, position: ConditionPosition): void {
        const values = this.mapValuesFromModel(model);
        this.forEachInput((element, index, elPosition, _) => {
            if (elPosition !== position) { return; }

            this.setElementValue(element, values[index] != null ? values[index] : null);
        });
    }

    // after floating filter changes, this sets the 'value' section. this is implemented by the base class
    // (as that's where value is controlled), the 'type' part from the floating filter is dealt with in this class.
    protected setValueFromFloatingFilter(value: V | null): void {
        this.forEachInput((element, index, position, _) => {
            this.setElementValue(element, index === 0 && position === 0 ? value : null);
        });
    }

    private isDefaultOperator(operator: JoinOperator): boolean {
        return operator === this.defaultJoinOperator;
    }

    private addChangedListeners() {
        if (this.isReadOnly()) {
            return;
        }

        const listener = () => this.onUiChanged();
        this.eType1.onValueChange(listener);
        this.eType2.onValueChange(listener);
        this.eJoinOperatorOr.onValueChange(listener);
        this.eJoinOperatorAnd.onValueChange(listener);

        this.forEachInput((element) => {
            this.attachElementOnChange(element, listener);
        });
    }

    /** returns true if the row passes the said condition */
    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: M) {
        const cellValue = this.getCellValue(params.node);
        const values = this.mapValuesFromModel(filterModel);
        const customFilterOption = this.optionsFactory.getCustomOption(filterModel.type);

        const customFilterResult = this.evaluateCustomFilter(customFilterOption, values, cellValue);
        if (customFilterResult != null) {
            return customFilterResult;
        }

        if (cellValue == null) {
            return this.evaluateNullValue(filterModel.type);
        }

        return this.evaluateNonNullValue(values, cellValue, filterModel, params);
    }

    protected evaluateCustomFilter(
        customFilterOption: IFilterOptionDef | undefined,
        values: Tuple<V>,
        cellValue: V,
    ): boolean | undefined {
        if (customFilterOption == null) {
            return;
        }

        const { predicate } = customFilterOption;
        // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
        if (predicate != null && !values.some(v => v == null)) {
            return predicate(values, cellValue);
        }

        // No custom filter invocation, indicate that to the caller.
        return;
    }

    protected isBlank(cellValue: V) {
        return cellValue == null ||
            (typeof cellValue === 'string' && cellValue.trim().length === 0);
    }

    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    public getModelAsString(model: ISimpleFilterModel): string {
        if (!model) {
            return '';
        }
        const isCombined = (model as any).operator != null;
        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<ISimpleFilterModel>;
            const { condition1, condition2 } = combinedModel || {};
            const customOption1 = this.getModelAsString(condition1);
            const customOption2 = this.getModelAsString(condition2);

            return [
                customOption1,
                combinedModel.operator,
                customOption2,
            ].join(' ');
        } else if (model.type === SimpleFilter.BLANK || model.type === SimpleFilter.NOT_BLANK) {
            const translate = this.localeService.getLocaleTextFunc();
            return translate(model.type, model.type);
        } else {
            const condition = model as ISimpleFilterModel;
            const customOption = this.optionsFactory.getCustomOption(condition.type);

            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            const { displayKey, displayName, numberOfInputs } = customOption || {};
            if (displayKey && displayName && numberOfInputs === 0) {
                this.localeService.getLocaleTextFunc()(displayKey, displayName);
                return displayName;
            }
            return this.conditionToString(condition, customOption);
        }
    }

    // creates text equivalent of FilterModel. if it's a combined model, this takes just one condition.
    protected abstract conditionToString(condition: ProvidedFilterModel, opts?: IFilterOptionDef): string;
}
