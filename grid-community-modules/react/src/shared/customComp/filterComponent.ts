import { IDoesFilterPassParams, IFilter, IFilterParams } from "@ag-grid-community/core";
import { CustomComponent } from "./customComponent";
import { CustomFilterParams, FilterMethods } from "./interfaces";

export class FilterComponent extends CustomComponent<IFilterParams, CustomFilterParams, FilterMethods> implements IFilter {
    private model: any = null;

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
        this.refreshProps(this.getProps());
    }

    public refresh(newParams: IFilterParams): boolean {
        this.sourceParams = newParams;
        this.refreshProps(this.getProps());
        return true;
    }

    protected getOptionalMethods(): string[] {
        return ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onAnyFilterChanged'];
    }

    private updateModel(model: any): void {
        this.setModel(model);
        setTimeout(() => {
            // ensure prop updates have happened
            this.sourceParams.filterChangedCallback();
        });
    }

    protected getProps(): CustomFilterParams {
        const props: CustomFilterParams = {
            ...this.sourceParams,
            model: this.model,
            onModelChange: (model: any) => this.updateModel(model),
            onUiChange: () => this.sourceParams.filterChangedCallback(),
            key: this.key
        } as any;
        // remove props in IFilterParams but not CustomFilterParams
        delete (props as any).filterChangedCallback;
        delete (props as any).filterModifiedCallback;
        delete (props as any).valueGetter;
        return props;
    }
}
