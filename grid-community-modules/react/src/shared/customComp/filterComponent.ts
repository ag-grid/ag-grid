import { AgPromise, BaseFilter, BaseFilterParams, IDoesFilterPassParams, IFilter, IFilterParams } from "@ag-grid-community/core";
import CustomWrapperComp from "../../reactUi/customComp/customWrapperComp";
import { CustomComponent,  useGridCustomComponent } from "./customComponent";

export function useGridFilter(methods: FilterMethods): void {
    return useGridCustomComponent(methods);
}

export interface FilterMethods extends BaseFilter {}

export interface CustomFilterParams<TData = any, TContext = any, TModel = any> extends BaseFilterParams<TData, TContext> {
    model: TModel | null,
    onModelChange: (model: TModel | null) => void,
    onUiChange: () => void,
}

export class FilterComponent extends CustomComponent<CustomFilterParams, FilterMethods> implements IFilter {
    private model: any = null;
    private filterParams!: IFilterParams;

    public init(params: IFilterParams): AgPromise<void> {
        this.filterParams = params;
        this.wrapperComponent = CustomWrapperComp;
        return super.init(this.createProps());
    }

    public isFilterActive(): boolean {
        return this.model != null;
    }

    public doesFilterPass(params: IDoesFilterPassParams<any>): boolean {
        return this.providedMethods.doesFilterPass(params);
    }

    public getModel(): any {
        return this.model;
    }

    public setModel(model: any): void {
        this.model = model;
        this.refreshProps(this.createProps());
    }

    public refresh(newParams: IFilterParams): boolean {
        this.filterParams = newParams;
        this.refreshProps(this.createProps());
        return true;
    }

    protected getOptionalMethods(): string[] {
        return ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onAnyFilterChanged'];
    }

    private updateModel(model: any): void {
        this.setModel(model);
        setTimeout(() => {
            // ensure prop updates have happened
            this.filterParams.filterChangedCallback();
        });
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
            onUiChange: () => this.filterParams.filterChangedCallback(),
            key: this.key
        } as any;
    }
}