import type { IFloatingFilter, IFloatingFilterParams } from 'ag-grid-community';
import { AgPromise, ProvidedFilter } from 'ag-grid-community';

import { addOptionalMethods } from './customComponentWrapper';
import type { CustomFloatingFilterCallbacks, CustomFloatingFilterProps } from './interfaces';

export function updateFloatingFilterParent(params: IFloatingFilterParams, model: any): void {
    params.parentFilterInstance((instance) => {
        // A provided filter's setModel() is deprecated for user code, but is the correct path here
        // (onModelChange is not deprecated), so suppress its deprecation warning rather than routing
        // through the public api, which would defer the update while data-type inference is pending.
        const modelSet =
            (instance instanceof ProvidedFilter ? instance.setModel(model, true) : instance.setModel(model)) ||
            AgPromise.resolve();
        modelSet.then(() => {
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
