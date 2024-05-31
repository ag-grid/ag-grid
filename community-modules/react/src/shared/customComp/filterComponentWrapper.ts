import type { IDoesFilterPassParams, IFilter, IFilterParams } from '@ag-grid-community/core';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomFilterCallbacks, CustomFilterProps } from './interfaces';

export class FilterComponentWrapper
    extends CustomComponentWrapper<IFilterParams, CustomFilterProps, CustomFilterCallbacks>
    implements IFilter
{
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

    public setModel(model: any): Promise<void> {
        this.model = model;
        return this.refreshProps();
    }

    public refresh(newParams: IFilterParams): boolean {
        this.sourceParams = newParams;
        this.refreshProps();
        return true;
    }

    protected override getOptionalMethods(): string[] {
        return ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onAnyFilterChanged'];
    }

    private updateModel(model: any): void {
        this.setModel(model).then(() => this.sourceParams.filterChangedCallback());
    }

    protected override getProps(): CustomFilterProps {
        const props = super.getProps();
        props.model = this.model;
        props.onModelChange = this.onModelChange;
        props.onUiChange = this.onUiChange;
        // remove props in IFilterParams but not CustomFilterProps
        delete (props as any).filterChangedCallback;
        delete (props as any).filterModifiedCallback;
        delete (props as any).valueGetter;
        return props;
    }
}
