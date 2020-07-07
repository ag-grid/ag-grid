import { IDoesFilterPassParams, IFilterOptionDef, ProvidedFilterModel } from '../../interfaces/iFilter';
import { RefSelector } from '../../widgets/componentAnnotations';
import { OptionsFactory } from './optionsFactory';
import { IProvidedFilterParams, ProvidedFilter } from './providedFilter';
import { Promise } from '../../utils';
import { AgSelect } from '../../widgets/agSelect';
import { AgRadioButton } from '../../widgets/agRadioButton';
import { forEach, every, some } from '../../utils/array';
import { setDisplayed, setDisabled } from '../../utils/dom';

export interface ISimpleFilterParams extends IProvidedFilterParams {
    filterOptions?: (IFilterOptionDef | string)[];
    defaultOption?: string;
    suppressAndOrCondition?: boolean;
    alwaysShowBothConditions?: boolean;
}

export interface ISimpleFilterModel extends ProvidedFilterModel {
    type: string;
}

export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: string;
    condition1: M;
    condition2: M;
}

export enum ConditionPosition { One, Two }

interface ISimpleFilterTranslations {
    filterOoo: string;
    empty: string;
    equals: string;
    notEqual: string;
    lessThan: string;
    greaterThan: string;
    inRange: string;
    inRangeStart: string;
    inRangeEnd: string;
    lessThanOrEqual: string;
    greaterThanOrEqual: string;
    contains: string;
    notContains: string;
    startsWith: string;
    endsWith: string;
    andCondition: string;
    orCondition: string;
}

const DEFAULT_TRANSLATIONS: ISimpleFilterTranslations = {
    filterOoo: 'Filter...',
    empty: 'Choose One',
    equals: 'Equals',
    notEqual: 'Not equal',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    inRange: 'In range',
    inRangeStart: 'From',
    inRangeEnd: 'To',
    lessThanOrEqual: 'Less than or equals',
    greaterThanOrEqual: 'Greater than or equals',
    contains: 'Contains',
    notContains: 'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    andCondition: 'AND',
    orCondition: 'OR',
};

/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export abstract class SimpleFilter<M extends ISimpleFilterModel> extends ProvidedFilter {

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

    @RefSelector('eOptions1') private eType1: AgSelect;
    @RefSelector('eOptions2') private eType2: AgSelect;
    @RefSelector('eJoinOperatorPanel') private eJoinOperatorPanel: HTMLElement;
    @RefSelector('eJoinOperatorAnd') private eJoinOperatorAnd: AgRadioButton;
    @RefSelector('eJoinOperatorOr') private eJoinOperatorOr: AgRadioButton;
    @RefSelector('eCondition2Body') private eCondition2Body: HTMLElement;

    private allowTwoConditions: boolean;
    private alwaysShowBothConditions: boolean;

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
    protected abstract setConditionIntoUi(model: ISimpleFilterModel, position: ConditionPosition): void;

    // returns true if this type requires a 'from' field, eg any filter that requires at least one text value
    protected showValueFrom(type: string): boolean {
        return !this.doesFilterHaveHiddenInput(type) && type !== SimpleFilter.EMPTY;
    }

    // returns true if this type requires a 'to' field, currently only 'range' returns true
    protected showValueTo(type: string): boolean {
        return type === SimpleFilter.IN_RANGE;
    }

    // floating filter calls this when user applies filter from floating filter
    public onFloatingFilterChanged(type: string, value: any): void {
        this.setTypeFromFloatingFilter(type);
        this.setValueFromFloatingFilter(value);
        this.onUiChanged(true);
    }

    protected setTypeFromFloatingFilter(type: string): void {
        this.eType1.setValue(type);
        this.eType2.setValue(this.optionsFactory.getDefaultOption());
        this.eJoinOperatorAnd.setValue(true);
    }

    public getModelFromUi(): M | ICombinedSimpleModel<M> {
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

    protected getCondition1Type(): string {
        return this.eType1.getValue();
    }

    protected getCondition2Type(): string {
        return this.eType2.getValue();
    }

    protected getJoinOperator(): string {
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

    protected setModelIntoUi(model: ISimpleFilterModel | ICombinedSimpleModel<M>): Promise<void> {
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

            this.eJoinOperatorAnd.setValue(true);
            this.eJoinOperatorOr.setValue(false);

            this.eType1.setValue(simpleModel.type);
            this.eType2.setValue(this.optionsFactory.getDefaultOption());

            this.setConditionIntoUi(simpleModel as M, ConditionPosition.One);
            this.setConditionIntoUi(null, ConditionPosition.Two);
        }

        return Promise.resolve();
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const model = this.getModel();

        if (model == null) { return true; }

        const { operator } = model as ICombinedSimpleModel<M>;
        const models: ISimpleFilterModel[] = [];

        if (operator) {
            const combinedModel = model as ICombinedSimpleModel<M>;

            models.push(combinedModel.condition1, combinedModel.condition2);
        } else {
            models.push(model as ISimpleFilterModel);
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

        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    }

    private putOptionsIntoDropdown(): void {
        const filterOptions = this.optionsFactory.getFilterOptions();

        forEach(filterOptions, option => {
            let value: string;
            let text: string;

            if (typeof option === 'string') {
                value = option;
                text = this.translate(value as keyof ISimpleFilterTranslations);
            } else {
                value = option.displayKey;

                const customOption = this.optionsFactory.getCustomOption(value);

                text = customOption ? customOption.displayName : this.translate(value as keyof ISimpleFilterTranslations);
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
        if (!this.allowTwoConditions) {
            setDisplayed(this.eJoinOperatorPanel, false);
            setDisplayed(this.eType2.getGui(), false);
            setDisplayed(this.eCondition2Body, false);

            return;
        }

        const secondFilterEnabled = this.isConditionUiComplete(ConditionPosition.One);

        if (this.alwaysShowBothConditions) {
            this.eJoinOperatorAnd.setDisabled(!secondFilterEnabled);
            this.eJoinOperatorOr.setDisabled(!secondFilterEnabled);
            this.eType2.setDisabled(!secondFilterEnabled);
            setDisabled(this.eCondition2Body, !secondFilterEnabled);
        } else {
            setDisplayed(this.eJoinOperatorPanel, secondFilterEnabled);
            setDisplayed(this.eType2.getGui(), secondFilterEnabled);
            setDisplayed(this.eCondition2Body, secondFilterEnabled);
        }
    }

    protected resetUiToDefaults(silent?: boolean): Promise<void> {
        const uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        const defaultOption = this.optionsFactory.getDefaultOption();

        this.eType1.setValue(defaultOption, silent);
        this.eType2.setValue(defaultOption, silent);
        this.eJoinOperatorAnd
            .setValue(true, silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('andCondition'));

        this.eJoinOperatorOr
            .setValue(false, silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('orCondition'));

        return Promise.resolve();
    }

    protected translate(toTranslate: keyof ISimpleFilterTranslations): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return translate(toTranslate, DEFAULT_TRANSLATIONS[toTranslate]);
    }

    private addChangedListeners() {
        const listener = () => this.onUiChanged();
        this.eType1.onValueChange(listener);
        this.eType2.onValueChange(listener);
        this.eJoinOperatorOr.onValueChange(listener);
        this.eJoinOperatorAnd.onValueChange(listener);
    }

    protected doesFilterHaveHiddenInput(filterType: string) {
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);
        return customFilterOption && customFilterOption.hideFilterInput;
    }
}
