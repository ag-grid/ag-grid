import {Component} from "../../../widgets/component";
import {IFloatingFilterComp, IFloatingFilterParams} from "../floatingFilter";
import {ProvidedFilterModel} from "../../../interfaces/iFilter";
import {SimpleFilter, ISimpleModel, ICombinedSimpleModel} from "../../provided/simpleFilter";
import {OptionsFactory} from "../../provided/optionsFactory";
import {IScalarFilterParams} from "../../provided/scalerFilter";
import {FilterChangedEvent} from "../../../events";

export abstract class SimpleFloatingFilter extends Component implements IFloatingFilterComp {

    // this method is on IFloatingFilterComp. because it's not implemented at this level, we have to
    // define it as an abstract method. it gets implemented in sub classes.
    public abstract onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;

    // creates text equivalent of FilterModel. if it's a combined model, this takes just one condition.
    protected abstract conditionToString(condition: ProvidedFilterModel): string;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract setEditable(editable: boolean): void;

    private lastType: string;

    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    protected getTextFromModel(model: ProvidedFilterModel): string {
        if (!model) {
            return null;
        }

        const isCombined = (<any>model).operator;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<ISimpleModel>>model;

            const con1Str = this.conditionToString(combinedModel.condition1);
            const con2Str = this.conditionToString(combinedModel.condition2);

            return `${con1Str} ${combinedModel.operator} ${con2Str}`;
        } else {
            const condition = <ISimpleModel>model;
            return this.conditionToString(condition);
        }
    }

    protected isEventFromFloatingFilter(event: FilterChangedEvent): boolean {
        return (event && (<any>event).source==='floating');
    }

    protected getLastType(): string {
        return this.lastType;
    }

    protected setLastTypeFromModel(model: ProvidedFilterModel): void {
        // if no model provided by the parent filter, we continue to use the last type used
        if (!model) {
            return;
        }

        const isCombined = (<any>model).operator;

        let condition: ISimpleModel;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<ISimpleModel>>model;
            condition = combinedModel.condition1;
        } else {
            condition = <ISimpleModel>model;
        }

        this.lastType = condition.type;
    }

    protected canWeEditAfterModelFromParentFilter(model: ProvidedFilterModel): boolean {

        if (!model) {
            // if no model, then we can edit as long as the lastType is something we can edit, as this
            // is the type we will provide to the parent filter if the user decides to use the floating filter.
            return this.isTypeEditable(this.lastType);
        }

        // never allow editing if the filter is combined (ie has two parts)
        const isCombined = (<any>model).operator;
        if (isCombined) {
            return false;
        }

        const simpleModel = <ISimpleModel>model;

        const typeIsEditable = this.isTypeEditable(simpleModel.type);
        return typeIsEditable;
    }

    public init(params: IFloatingFilterParams): void {
        const optionsFactory = new OptionsFactory();
        optionsFactory.init(params.filterParams as IScalarFilterParams, this.getDefaultFilterOptions());
        this.lastType = optionsFactory.getDefaultOption();

        // we are editable if:
        // 1) there is a type (user has configured filter wrong if not type)
        //  AND
        // 2) the default type is not 'in range'
        const editable = this.isTypeEditable(this.lastType);
        this.setEditable(editable);
    }

    private isTypeEditable(type: string): boolean {
        return type
            && (type != SimpleFilter.IN_RANGE)
            && (type != SimpleFilter.EMPTY);
    }
}
