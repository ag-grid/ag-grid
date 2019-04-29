import {Component} from "../../widgets/component";
import {IFloatingFilterComp, IFloatingFilterParams} from "./floatingFilter";
import {RefSelector} from "../../widgets/componentAnnotations";
import {TextFilter2, TextFilterModel2} from "../provided/text/textFilter2";
import {FilterModel} from "../../interfaces/iFilter";
import {AbstractSimpleFilter, IAbstractSimpleModel, ICombinedSimpleModel} from "../provided/abstractSimpleFilter";
import {_} from "../../utils";
import {Constants} from "../../constants";
import {AbstractProvidedFilter} from "../provided/abstractProvidedFilter";
import {TextFilterModel} from "../provided/text/textFilter";
import {NumberFilter2, NumberFilter2Model} from "../provided/number/numberFilter2";
import {PostConstruct} from "../../context/context";
import {OptionsFactory} from "../provided/optionsFactory";
import {IComparableFilterParams} from "../provided/abstractComparableFilter";

export abstract class AbstractSimpleFloatingFilter extends Component implements IFloatingFilterComp {

    public abstract onParentModelChanged(model: FilterModel): void;

    protected lastType: string;

    protected abstract conditionToString(condition: FilterModel): string;
    protected abstract getDefaultFilterOptions(): string[];

    protected getTextFromModel(model: FilterModel): string {
        if (!model) {
            return null;
        }

        const isCombined = (<any>model).operator;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<NumberFilter2Model>>model;

            const con1Str = this.conditionToString(combinedModel.condition1);
            const con2Str = this.conditionToString(combinedModel.condition2);

            return `${con1Str} ${combinedModel.operator} ${con2Str}`;
        } else {
            const condition = <NumberFilter2Model>model;
            return this.conditionToString(condition);
        }
    }

    protected allowEditing(model: FilterModel): boolean {

        if (!model) {
            return true;
        }

        const isCombined = (<any>model).operator;
        if (isCombined) {
            return false;
        }

        const simpleModel = <IAbstractSimpleModel>model;

        return (simpleModel.type != AbstractSimpleFilter.IN_RANGE);
    }

    public init(params: IFloatingFilterParams): void {
        const optionsFactory = new OptionsFactory();
        optionsFactory.init(params.filterParams as IComparableFilterParams, this.getDefaultFilterOptions());
        this.lastType = optionsFactory.getDefaultOption();

        // const columnDef = (params.column.getDefinition() as any);
        // if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions[0] === 'inRange') {
        //     this.eFloatingFilterText.disabled = true;
        // }
    }
}

export abstract class AbstractTextInputFloatingFilter extends AbstractSimpleFloatingFilter {

    @RefSelector('eFloatingFilterText')
    private eFloatingFilterText: HTMLInputElement;

    protected params: IFloatingFilterParams;

    protected abstract getModelFromText(value: string): FilterModel;

    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(
            `<div class="ag-input-text-wrapper">
                <input ref="eFloatingFilterText" class="ag-floating-filter-input">
            </div>`);
    }

    public onParentModelChanged(model: FilterModel): void {
        const modelString = this.getTextFromModel(model);
        this.eFloatingFilterText.value = modelString;
        this.checkDisabled(model);
    }

    public init(params: IFloatingFilterParams): void {
        super.init(params);
        this.params = params;
        this.checkDisabled(null);

        const debounceMs: number = params.debounceMs != null ? params.debounceMs : 500;
        const toDebounce: () => void = _.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);

        this.addDestroyableEventListener(this.eFloatingFilterText, 'input', toDebounce);
        this.addDestroyableEventListener(this.eFloatingFilterText, 'keypress', toDebounce);
        this.addDestroyableEventListener(this.eFloatingFilterText, 'keydown', toDebounce);

        const columnDef = (params.column.getDefinition() as any);
        if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions.length === 1 && columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eFloatingFilterText.disabled = true;
        }
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const model = this.getModelFromText(this.eFloatingFilterText.value);
        const enterKeyPressed = _.isKeyPressed(e, Constants.KEY_ENTER);

        this.params.parentFilterInstance( filterInstance => {
            if (filterInstance) {
                const providedFilter = <AbstractProvidedFilter> filterInstance;
                providedFilter.onFloatingFilterChanged({
                    model: model,
                    apply: enterKeyPressed
                })
            }
        });
    }

    private checkDisabled(model: FilterModel): void {
        const disabled = !this.allowEditing(model);
        this.eFloatingFilterText.disabled = disabled;
    }
}

export class TextFloatingFilter2 extends AbstractTextInputFloatingFilter {

    protected conditionToString(condition: TextFilterModel2): string {
        // it's not possible to have 'in range' for string, so no need to check for it.
        // also cater for when the type doesn't need a value
        if (condition.filter!=null) {
            return `${condition.filter}`;
        } else {
            return `${condition.type}`;
        }
    }

    protected getModelFromText(value: string): TextFilterModel {
        if (!value) {
            return null;
        } else {
            return {
                type: null,
                filter: value,
                filterType: 'text'
            };
        }
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter2.DEFAULT_FILTER_OPTIONS;
    }

}

export class NumberFloatingFilter2 extends AbstractTextInputFloatingFilter {

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter2.DEFAULT_FILTER_OPTIONS;
    }

    protected conditionToString(condition: NumberFilter2Model): string {

        const isRange = condition.type == AbstractSimpleFilter.IN_RANGE;

        if (isRange) {
            return `${condition.filter}-${condition.filterTo}`;
        } else {
            // cater for when the type doesn't need a value
            if (condition.filter!=null) {
                return `${condition.filter}`;
            } else {
                return `${condition.type}`;
            }
        }
    }

    protected getModelFromText(value: string): NumberFilter2Model {
        if (!value) {
            return null;
        } else {
            return {
                type: null,
                filter: this.stringToFloat(value),
                filterType: 'text'
            };
        }
    }

    private stringToFloat(value: string): number {
        let filterText = _.makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        let newFilter: number;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        } else {
            newFilter = null;
        }
        return newFilter;
    }
}
