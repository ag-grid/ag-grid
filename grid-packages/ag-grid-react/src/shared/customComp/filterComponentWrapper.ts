import { IDoesFilterPassParams, IFilter, IFilterParams } from "ag-grid-community";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomFilterProps, CustomFilterCallbacks } from "./interfaces";

export class FilterComponentWrapper extends CustomComponentWrapper<IFilterParams, CustomFilterProps, CustomFilterCallbacks> implements IFilter {
    private model: any = null;
    private readonly onModelChange = (model: any) => this.updateModel(model);
    private readonly onUiChange = () => this.sourceParams.filterChangedCallback();

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
        this.refreshProps();
    }

    public refresh(newParams: IFilterParams): boolean {
        this.sourceParams = newParams;
        this.refreshProps();
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

    protected getProps(): CustomFilterProps {
        const props: CustomFilterProps = {
            ...this.sourceParams,
            model: this.model,
            onModelChange: this.onModelChange,
            onUiChange: () => this.onUiChange,
            key: this.key
        } as any;
        // remove props in IFilterParams but not CustomFilterProps
        delete (props as any).filterChangedCallback;
        delete (props as any).filterModifiedCallback;
        delete (props as any).valueGetter;
        return props;
    }
}
