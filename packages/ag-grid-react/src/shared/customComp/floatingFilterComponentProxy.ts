import type { IFloatingFilter, IFloatingFilterParams } from 'ag-grid-community';
import { AgPromise, ProvidedFilter, _legacyFilterMethods } from 'ag-grid-community';

import { addOptionalMethods } from './customComponentWrapper';
import type { CustomFloatingFilterCallbacks, CustomFloatingFilterProps } from './interfaces';

export function updateFloatingFilterParent(params: IFloatingFilterParams, model: any): void {
    const filterChanged = () => params.filterParams.filterChangedCallback();
    params.parentFilterInstance((instance) => {
        if (instance instanceof ProvidedFilter) {
            void params.api.setColumnFilterModel(params.column, model).then(filterChanged);
            return;
        }
        // A custom Multi Filter child shares the Multi Filter column, so the API would replace every child's model.
        (_legacyFilterMethods(instance).setModel(model) || AgPromise.resolve()).then(filterChanged);
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
