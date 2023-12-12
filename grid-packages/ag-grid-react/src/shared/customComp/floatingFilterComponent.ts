import { AgPromise,  IFloatingFilter, IFloatingFilterParams } from "ag-grid-community";
import { addOptionalMethods } from "./customComponent";
import { CustomFloatingFilterProps, CustomFloatingFilterCallbacks } from "./interfaces";

export class FloatingFilterComponent implements IFloatingFilter {
    private model: any = null;

    constructor(private floatingFilterParams: IFloatingFilterParams, private readonly refreshProps: () => void) {}

    public getProps(): CustomFloatingFilterProps {
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

    public refresh(params: IFloatingFilterParams): void {
        this.floatingFilterParams = params;
        this.refreshProps();
    }

    public setMethods(methods: CustomFloatingFilterCallbacks): void {
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
