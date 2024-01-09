import { AgPromise,  IFloatingFilter, IFloatingFilterParams } from "@ag-grid-community/core";
import { addOptionalMethods } from "./customComponentWrapper";
import { CustomFloatingFilterProps, CustomFloatingFilterCallbacks } from "./interfaces";

export function updateFloatingFilterParent(params: IFloatingFilterParams, model: any): void {
    params.parentFilterInstance(instance => {
        (instance.setModel(model) || AgPromise.resolve()).then(() => {
            setTimeout(() => {
                // ensure prop updates have happened
                params.filterParams.filterChangedCallback();
            });
        });
    });
}

export class FloatingFilterComponentProxy implements IFloatingFilter {
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
        updateFloatingFilterParent(this.floatingFilterParams, model);
    }
}
