import { IDoesFilterPassParams, IFilterOptionDef, ProvidedFilterModel } from '../../interfaces/iFilter';
import { RefSelector } from '../../widgets/componentAnnotations';
import { OptionsFactory } from './optionsFactory';
import { IProvidedFilterParams, ProvidedFilter } from './providedFilter';
import { AgPromise } from '../../utils';
import { AgSelect } from '../../widgets/agSelect';
import { AgRadioButton } from '../../widgets/agRadioButton';
import { forEach, every, some, includes } from '../../utils/array';
import { setDisplayed, setDisabled } from '../../utils/dom';
import { IFilterLocaleText } from '../filterLocaleText';

export type JoinOperator = 'AND' | 'OR';

export interface ISimpleFilterParams extends IProvidedFilterParams {
    /**
     * Array of filter options to present to the user. See [Filter Options](/filter-provided-simple/#simple-filter-options) for all options available to each filter type.
     */
    filterOptions?: (IFilterOptionDef | string)[];
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
}

export interface ISimpleFilterModel extends ProvidedFilterModel {
    /** One of the filter options, e.g. `'equals'` */
    type?: string | null;
}

export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: JoinOperator;
    condition1: M;
    condition2: M;
}

export enum ConditionPosition { One, Two }

/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export abstract class SimpleFilter<M extends ISimpleFilterModel, V> extends ProvidedFilter<M | ICombinedSimpleModel<M>, V> {

    public static EMPTY = 'empty';
    public static EQUALS = 'equals';
    public static NOT_EQUAL = 'notEqual';
    public static LESS_THAN = 'lessThan';
    public static LESS_THAN_OR_EQUAL = 'lessThanOrEqual';
    public static GREATER_THAN = 'greaterThan';
    public static GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';
    public static IN_RANGE = 'inRange';
    public static CONTAINS = 'contains';
    public static NOT_CONTAINS = 'notContains';
    public static STARTS_WITH = 'startsWith';
    public static ENDS_WITH = 'endsWith';

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

    protected optionsFactory: OptionsFactory;
    protected abstract getDefaultFilterOptions(): string[];

    // gets called once during initialisation, to build up the html template
    protected abstract createValueTemplate(position: ConditionPosition): string;

    // returns true in the row passes the said condition
    protected abstract individualConditionPasses(params: IDoesFilterPassParams, type: ISimpleFilterModel): boolean;

    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    protected abstract isConditionUiComplete(position: ConditionPosition): boolean;

    // filter uses this to know if new model is different from previous model, ie if filter has changed
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;

    // after floating filter changes, this sets the 'value' section. this is implemented by the base class
    // (as that's where value is controlled), the 'type' part from the floating filter is dealt with in this class.
    protected abstract setValueFromFloatingFilter(value: string): void;

    // getModel() calls this to create the two conditions. if only one condition,
    // the result is returned by getModel(), otherwise is called twice and both results
    // returned in a CombinedFilter object.
    protected abstract createCondition(position: ConditionPosition): M;

    // puts model values into the UI
    protected abstract setConditionIntoUi(model: ISimpleFilterModel | null, position: ConditionPosition): void;

    // returns true if this type requires a 'from' field, eg any filter that requires at least one text value
    protected showValueFrom(type?: string | null): boolean {
        return !this.doesFilterHaveHiddenInput(type) && type !== SimpleFilter.EMPTY;
    }

    // returns true if this type requires a 'to' field, currently only 'range' returns true
    protected showValueTo(type?: string | null): boolean {
        return type === SimpleFilter.IN_RANGE;
    }

    // floating filter calls this when user applies filter from floating filter
    public onFloatingFilterChanged(type: string | null | undefined, value: any): void {
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

    protected getCondition1Type(): string | null | undefined {
        return this.eType1.getValue();
    }

    protected getCondition2Type(): string | null | undefined {
        return this.eType2.getValue();
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

        const combineFunction = operator && operator === 'OR' ? some : every;

        return combineFunction(models, m => this.individualConditionPasses(params, m));
    }

    protected setParams(params: ISimpleFilterParams): void {
        super.setParams(params);

        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());

        this.allowTwoConditions = !params.suppressAndOrCondition;
        this.alwaysShowBothConditions = !!params.alwaysShowBothConditions;
        this.defaultJoinOperator = this.getDefaultJoinOperator(params.defaultJoinOperator);

        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    }

    private getDefaultJoinOperator(defaultJoinOperator?: JoinOperator): JoinOperator | undefined {
        return includes(['AND', 'OR'], defaultJoinOperator) ? defaultJoinOperator : 'AND';
    }

    private putOptionsIntoDropdown(): void {
        const filterOptions = this.optionsFactory.getFilterOptions();

        forEach(filterOptions, option => {
            let value: string;
            let text: string;

            if (typeof option === 'string') {
                value = option;
                text = this.translate(value as keyof IFilterLocaleText);
            } else {
                value = option.displayKey;

                const customOption = this.optionsFactory.getCustomOption(value);

                text = customOption ?
                    this.gridOptionsWrapper.getLocaleTextFunc()(customOption.displayKey, customOption.displayName) :
                    this.translate(value as keyof IFilterLocaleText);
            }

            const createOption = () => ({ value, text });

            this.eType1.addOption(createOption());
            this.eType2.addOption(createOption());
        });

        const readOnly = filterOptions.length <= 1;

        this.eType1.setDisabled(readOnly);
        this.eType2.setDisabled(readOnly);
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
        const isCondition2Visible = this.isCondition2Enabled();
        const isCondition2Disabled = this.isReadOnly() || !isCondition2Visible;
    
        if (this.alwaysShowBothConditions) {
            this.eJoinOperatorAnd.setDisabled(isCondition2Disabled);
            this.eJoinOperatorOr.setDisabled(isCondition2Disabled);
            this.eType2.setDisabled(isCondition2Disabled);
            setDisabled(this.eCondition2Body, isCondition2Disabled);
        } else {
            setDisplayed(this.eJoinOperatorPanel, isCondition2Visible);
            setDisplayed(this.eType2.getGui(), isCondition2Visible);
            setDisplayed(this.eCondition2Body, isCondition2Visible);
        }
    }

    protected isCondition2Enabled(): boolean {
        return this.allowTwoConditions && 
            this.isConditionUiComplete(ConditionPosition.One) &&
            (!this.isReadOnly() || this.isConditionUiComplete(ConditionPosition.Two));
    }

    protected resetUiToDefaults(silent?: boolean): AgPromise<void> {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        const uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        const defaultOption = this.optionsFactory.getDefaultOption();

        this.eType1
            .setValue(defaultOption, silent)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly());
        this.eType2
            .setValue(defaultOption, silent)
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

        return AgPromise.resolve();
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
    }

    protected doesFilterHaveHiddenInput(filterType?: string | null) {
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);

        return customFilterOption && customFilterOption.hideFilterInput;
    }
}
