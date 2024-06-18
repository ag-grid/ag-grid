import type { IFloatingFilter, IFloatingFilterParams } from 'ag-grid-community';

import { addOptionalMethods } from './customComponentWrapper';
import type { CustomFloatingFilterCallbacks, CustomFloatingFilterProps } from './interfaces';

export function updateFloatingFilterParent(params: IFloatingFilterParams, model: any): void {
    params.parentFilterInstance((instance) => {
        (instance.setModel(model) || Promise.resolve()).then(() => {
            params.filterParams.filterChangedCallback();
        });
    });
}

export class FloatingFilterComponentProxy implements IFloatingFilter {
    private model: any = null;
    private readonly onModelChange = (model: any) => this.updateModel(model);

    constructor(
        private floatingFilterParams: IFloatingFilterParams,
        private readonly refreshProps: () => void
    ) {}

    public getProps(): CustomFloatingFilterProps {
        return {
            ...this.floatingFilterParams,
            model: this.model,
            onModelChange: this.onModelChange,
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
