import {Component} from "../../../widgets/component";
import {IFloatingFilterComp, IFloatingFilterParams} from "../floatingFilter";
import {FilterModel} from "../../../interfaces/iFilter";
import {AbstractSimpleFilter, IAbstractSimpleModel, ICombinedSimpleModel} from "../../provided/abstractSimpleFilter";
import {OptionsFactory} from "../../provided/optionsFactory";
import {IScalarFilterParams} from "../../provided/abstractScalerFilter";

export abstract class AbstractSimpleFloatingFilter extends Component implements IFloatingFilterComp {

    // this method is on IFloatingFilterComp. because it's not implemented at this level, we have to
    // define it as an abstract method. it gets implemented in sub classes.
    public abstract onParentModelChanged(model: FilterModel): void;

    // creates text equivalent of FilterModel. if it's a combined model, this takes just one condition.
    protected abstract conditionToString(condition: FilterModel): string;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract setEditable(editable: boolean): void;

    private lastType: string;

    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    protected getTextFromModel(model: FilterModel): string {
        if (!model) {
            return null;
        }

        const isCombined = (<any>model).operator;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<IAbstractSimpleModel>>model;

            const con1Str = this.conditionToString(combinedModel.condition1);
            const con2Str = this.conditionToString(combinedModel.condition2);

            return `${con1Str} ${combinedModel.operator} ${con2Str}`;
        } else {
            const condition = <IAbstractSimpleModel>model;
            return this.conditionToString(condition);
        }
    }

    protected getLastType(): string {
        return this.lastType;
    }

    protected setLastTypeFromModel(model: FilterModel): void {
        // if no model provided by the parent filter, we continue to use the last type used
        if (!model) {
            return;
        }

        const isCombined = (<any>model).operator;

        let condition: IAbstractSimpleModel;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<IAbstractSimpleModel>>model;
            condition = combinedModel.condition1;
        } else {
            condition = <IAbstractSimpleModel>model;
        }

        this.lastType = condition.type;
    }

    protected canWeEditAfterModelFromParentFilter(model: FilterModel): boolean {

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

        const simpleModel = <IAbstractSimpleModel>model;

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
        return type && (type != AbstractSimpleFilter.IN_RANGE)
    }
}
