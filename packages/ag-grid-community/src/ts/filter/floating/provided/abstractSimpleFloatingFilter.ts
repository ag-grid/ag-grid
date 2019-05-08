import {Component} from "../../../widgets/component";
import {IFloatingFilterComp, IFloatingFilterParams} from "../floatingFilter";
import {FilterModel} from "../../../interfaces/iFilter";
import {AbstractSimpleFilter, IAbstractSimpleModel, ICombinedSimpleModel} from "../../provided/abstractSimpleFilter";
import {NumberFilterModel} from "../../provided/number/numberFilter";
import {OptionsFactory} from "../../provided/optionsFactory";
import {IScalarFilterParams} from "../../provided/abstractScalerFilter";

export abstract class AbstractSimpleFloatingFilter extends Component implements IFloatingFilterComp {

    public abstract onParentModelChanged(model: FilterModel): void;

    protected lastType: string;

    protected abstract conditionToString(condition: FilterModel): string;
    protected abstract getDefaultFilterOptions(): string[];

    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
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
        optionsFactory.init(params.filterParams as IScalarFilterParams, this.getDefaultFilterOptions());
        this.lastType = optionsFactory.getDefaultOption();

        // const columnDef = (params.column.getDefinition() as any);
        // if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions[0] === 'inRange') {
        //     this.eFloatingFilterText.disabled = true;
        // }
    }
}
