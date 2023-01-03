import { Component } from '../../../widgets/component';
import { IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';
import { IFilterOptionDef, ProvidedFilterModel } from '../../../interfaces/iFilter';
import { ICombinedSimpleModel, ISimpleFilter, ISimpleFilterModel, SimpleFilter } from '../../provided/simpleFilter';
import { OptionsFactory } from '../../provided/optionsFactory';
import { ScalarFilterParams } from '../../provided/scalarFilter';
import { FilterChangedEvent } from '../../../events';
import { ProvidedFilterParams } from '../../provided/providedFilter';

export abstract class SimpleFloatingFilter extends Component implements IFloatingFilterComp<ISimpleFilter> {

    // this method is on IFloatingFilterComp. because it's not implemented at this level, we have to
    // define it as an abstract method. it gets implemented in sub classes.
    public abstract onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;

    // creates text equivalent of FilterModel. if it's a combined model, this takes just one condition.
    protected abstract conditionToString(condition: ProvidedFilterModel, opts?: IFilterOptionDef): string;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract setEditable(editable: boolean): void;

    private lastType: string | null | undefined;

    private optionsFactory: OptionsFactory;

    private readOnly: boolean;

    protected getDefaultDebounceMs(): number {
        return 0;
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    protected getTextFromModel(model: ISimpleFilterModel): string | null {
        if (!model) { return null; }

        const isCombined = (model as any).operator != null;
        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<ISimpleFilterModel>;
            const { condition1, condition2 } = combinedModel || {};
            const customOption1 = this.getTextFromModel(condition1);
            const customOption2 = this.getTextFromModel(condition2);

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

    protected isEventFromFloatingFilter(event: FilterChangedEvent): boolean | undefined {
        return event && event.afterFloatingFilter;
    }

    protected isEventFromDataChange(event: FilterChangedEvent): boolean | undefined {
        return event?.afterDataChange;
    }

    protected getLastType(): string | null | undefined {
        return this.lastType;
    }

    protected isReadOnly(): boolean {
        return this.readOnly;
    }

    protected setLastTypeFromModel(model: ProvidedFilterModel): void {
        // if no model provided by the parent filter use default
        if (!model) {
            this.lastType = this.optionsFactory.getDefaultOption();
            return;
        }

        const isCombined = (model as any).operator;

        let condition: ISimpleFilterModel;

        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<ISimpleFilterModel>;
            condition = combinedModel.condition1;
        } else {
            condition = model as ISimpleFilterModel;
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
        const isCombined = (model as any).operator;

        if (isCombined) {
            return false;
        }

        const simpleModel = model as ISimpleFilterModel;

        return this.isTypeEditable(simpleModel.type);
    }

    public init(params: IFloatingFilterParams): void {
        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params.filterParams as ScalarFilterParams, this.getDefaultFilterOptions());
        this.lastType = this.optionsFactory.getDefaultOption();

        // readOnly is a property of ProvidedFilterParams - we need to find a better (type-safe)
        // way to support reading this in the future.
        this.readOnly = !!(params.filterParams as ProvidedFilterParams).readOnly;

        // we are editable if:
        // 1) there is a type (user has configured filter wrong if not type)
        //  AND
        // 2) the default type is not 'in range'
        const editable = this.isTypeEditable(this.lastType);
        this.setEditable(editable);
    }

    private doesFilterHaveSingleInput(filterType: string) {
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);
        const { numberOfInputs } = customFilterOption || {};
        return numberOfInputs == null || numberOfInputs == 1;
    }

    private isTypeEditable(type?: string | null): boolean {
        const uneditableTypes: string[] = [
            SimpleFilter.IN_RANGE, SimpleFilter.EMPTY, SimpleFilter.BLANK, SimpleFilter.NOT_BLANK,
        ];
        return !!type &&
            !this.isReadOnly() &&
            this.doesFilterHaveSingleInput(type) &&
            uneditableTypes.indexOf(type) < 0;
    }
}
