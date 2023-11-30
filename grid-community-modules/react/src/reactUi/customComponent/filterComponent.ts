import { AgPromise, BaseFilter, BaseFilterParams, IDoesFilterPassParams, IFilter, IFilterParams } from "@ag-grid-community/core";
import { useContext, useState } from "react";
import { CustomComponent, CustomContext } from "./customComponent";

export function useGridFilter(methods: FilterMethods): IFilterParams {
    const { setMethods, params, addCallback } = useContext(CustomContext);
    setMethods(methods);
    const [props, setProps] = useState(params);
    addCallback(newProps => setProps(newProps));
    return props;
}

export interface DoesFilterPassParams<TData = any, TValue = any, TModel = any> extends IDoesFilterPassParams<TData> {
    model: TModel,
    value: TValue | null | undefined,
}

export interface FilterMethods extends BaseFilter {
    /**
     * The grid will ask each active filter, in turn, whether each row in the grid passes. If any
     * filter fails, then the row will be excluded from the final set. The method is provided a
     * params object with attributes node (the rodNode the grid creates that wraps the data) and data
     * (the data object that you provided to the grid for that row).
     */
    doesFilterPass: (params: DoesFilterPassParams) => boolean;
}

export interface CustomFilterParams<TData = any, TContext = any, TModel = any> extends BaseFilterParams<TData, TContext> {
    model: TModel | null,
    onModelChange: (model: TModel | null) => void,
    onUiChange: () => void,
}

export class FilterComponent extends CustomComponent<CustomFilterParams, FilterMethods> implements IFilter {
    private model: any;
    private filterParams!: IFilterParams;

    public init(params: any): AgPromise<void> {
        this.filterParams = params;
        return super.init(this.createProps());
    }

    public isFilterActive(): boolean {
        return this.model != null;
    }

    public doesFilterPass(params: IDoesFilterPassParams<any>): boolean {
        return this.providedMethods.doesFilterPass({
            data: params.data,
            node: params.node,
            model: this.model,
            value: this.filterParams.getValue(params.node)
        });
    }

    public getModel(): any {
        return this.model;
    }

    public setModel(model: any): void | AgPromise<void> {
        this.model = model;
    }

    public refresh(newParams: IFilterParams): boolean {
        this.filterParams = newParams;
        return true;
    }

    protected getOptionalMethods(): string[] {
        return ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onAnyFilterChanged'];
    }

    private updateModel(model: any): void {
        this.model = model;
        this.filterParams.filterChangedCallback();
        this.refreshProps(this.createProps());
    }

    private createProps(): CustomFilterParams {
        const { api, columnApi, context, colDef, column, doesRowPassOtherFilter, getValue, rowModel } = this.filterParams;
        return {
            api,
            columnApi,
            context, 
            colDef, 
            column,
            doesRowPassOtherFilter,
            getValue, 
            rowModel,
            model: this.model,
            onModelChange: (model: any) => this.updateModel(model),
            onUiChange: () => this.filterParams.filterChangedCallback()
        };
    }
}