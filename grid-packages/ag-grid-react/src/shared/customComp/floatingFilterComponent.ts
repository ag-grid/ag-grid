import { BaseFloatingFilter, IFilter, IFloatingFilter, IFloatingFilterParams, IFloatingFilterParent } from "ag-grid-community";
import { addOptionalMethods, useGridCustomComponent } from "./customComponent";

export function useGridFloatingFilter(methods: FloatingFilterMethods): void {
    useGridCustomComponent(methods);
}

export interface CustomFloatingFilterParams<P = IFloatingFilterParent & IFilter, TData = any, TContext = any, TModel = any> extends IFloatingFilterParams<P, TData, TContext> {
    model: TModel | null;
    onModelChange: (model: TModel | null) => void;
}

export interface FloatingFilterMethods extends BaseFloatingFilter {}

export class FloatingFilterComponent implements IFloatingFilter {
    private model: any = null;

    constructor(private floatingFilterParams: IFloatingFilterParams, private refreshProps: () => void) {}

    public getProps(): CustomFloatingFilterParams {
        return {
            ...this.floatingFilterParams,
            model: this.model,
            onModelChange: model => this.updateModel(model)
        };
    }

    public onParentModelChanged(parentModel: any): void {
        this.model = parentModel;
    }

    public onParamsUpdated(params: IFloatingFilterParams): void {
        this.floatingFilterParams = params;
        this.refreshProps();
    }

    public setMethods(methods: FloatingFilterMethods): void {
        addOptionalMethods(this.getOptionalMethods(), methods, this);
    }

    private getOptionalMethods(): string[] {
        return ['afterGuiAttached'];
    }

    private updateModel(model: any): void {
        this.model = model;
        this.refreshProps();
    }
}