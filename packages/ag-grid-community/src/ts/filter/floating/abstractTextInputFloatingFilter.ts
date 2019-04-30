import {Component} from "../../widgets/component";
import {IFloatingFilterComp, IFloatingFilterParams} from "./floatingFilter";
import {RefSelector} from "../../widgets/componentAnnotations";
import {FilterModel} from "../../interfaces/iFilter";
import {AbstractSimpleFilter, IAbstractSimpleModel, ICombinedSimpleModel} from "../provided/abstractSimpleFilter";
import {_} from "../../utils";
import {Constants} from "../../constants";
import {AbstractProvidedFilter} from "../provided/abstractProvidedFilter";
import {NumberFilterModel} from "../provided/number/numberFilter";
import {PostConstruct} from "../../context/context";
import {OptionsFactory} from "../provided/optionsFactory";
import {IComparableFilterParams} from "../provided/abstractComparableFilter";
import {TextFilter, TextFilterModel} from "../provided/text/textFilter";

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
            const combinedModel = <ICombinedSimpleModel<NumberFilterModel>>model;

            const con1Str = this.conditionToString(combinedModel.condition1);
            const con2Str = this.conditionToString(combinedModel.condition2);

            return `${con1Str} ${combinedModel.operator} ${con2Str}`;
        } else {
            const condition = <NumberFilterModel>model;
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


