import { AgPromise,  IFloatingFilter, IFloatingFilterParams } from "@ag-grid-community/core";
import { addOptionalMethods } from "./customComponent";
import { CustomFloatingFilterParams, FloatingFilterMethods } from "./interfaces";

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
        this.refreshProps();
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
        this.floatingFilterParams.parentFilterInstance(instance => {
            (instance.setModel(model) || AgPromise.resolve()).then(() => {
                this.floatingFilterParams.filterParams.filterChangedCallback();
            });
        });
    }
}