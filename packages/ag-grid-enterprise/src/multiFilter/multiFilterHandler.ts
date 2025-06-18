import type {
    AgColumn,
    DoesFilterPassParams,
    FilterHandler,
    FilterHandlerBaseParams,
    FilterHandlerParams,
    IMultiFilterDef,
    MultiFilterHandler as IMultiFilterHandler,
    IMultiFilterModel,
    IMultiFilterParams,
} from 'ag-grid-community';
import { BeanStub, _removeFromArray, _warn } from 'ag-grid-community';

import {
    forEachReverse,
    getFilterModelForIndex,
    getMultiFilterDefs,
    getUpdatedMultiFilterModel,
    updateGetValue,
} from './multiFilterUtil';

interface HandlerWrapper {
    handler: FilterHandler;
    handlerParams: FilterHandlerBaseParams;
}

export class MultiFilterHandler
    extends BeanStub
    implements FilterHandler<any, any, IMultiFilterModel, IMultiFilterParams>, IMultiFilterHandler
{
    private params: FilterHandlerParams<any, any, IMultiFilterModel, IMultiFilterParams>;
    private handlerWrappers: (HandlerWrapper | undefined)[] = [];
    /** ui active. could still have null model */
    private activeFilterIndices: number[] = [];
    private filterDefs: IMultiFilterDef[] = [];

    public init(params: FilterHandlerParams<any, any, IMultiFilterModel, IMultiFilterParams>): void {
        this.params = params;

        const filterDefs = getMultiFilterDefs(params.filterParams);
        this.filterDefs = filterDefs;
        filterDefs.forEach((def, index) => {
            const wrapper = this.beans.colFilter!.createHandler(params.column as AgColumn, def, 'agTextColumnFilter');
            this.handlerWrappers.push(wrapper);
            if (!wrapper) {
                _warn(278, { colId: params.column.getColId() });
                return;
            }
            const { handler, handlerParams } = wrapper;
            handler.init?.({
                ...this.updateHandlerParams(handlerParams!, index),
                model: getFilterModelForIndex(params.model, index),
                source: 'init',
            });
        });
        this.resetActiveList(params.model);
    }

    public refresh(params: FilterHandlerParams<any, any, IMultiFilterModel> & IMultiFilterParams): void {
        this.params = params;
        const { model, source, filterParams } = params;
        const filters = filterParams?.filters;

        this.handlerWrappers.forEach((wrapper, index) => {
            if (wrapper) {
                const handlerParams = this.updateHandlerParams(params, index);
                const originalFilterParams = handlerParams.filterParams;
                const providedFilterParams = filters?.[index].filterParams;
                const filterParamsForFilter = providedFilterParams
                    ? { ...originalFilterParams, ...providedFilterParams }
                    : originalFilterParams;
                const updatedParams = {
                    ...this.updateHandlerParams(params, index),
                    filterParams: filterParamsForFilter,
                };
                wrapper.handlerParams = updatedParams;
                wrapper.handler.refresh?.({
                    ...updatedParams,
                    model: getFilterModelForIndex(model, index),
                    source,
                });
            }
        });
        if (params.source !== 'floating' && params.source !== 'ui') {
            this.resetActiveList(params.model);
        }
    }

    private updateHandlerParams(params: FilterHandlerBaseParams, index: number): FilterHandlerBaseParams {
        const { onModelChange, doesRowPassOtherFilter, getValue } = params;
        const handlerParams: FilterHandlerBaseParams = {
            ...params!,
            onModelChange: (newModel, additionalEventAttributes) =>
                onModelChange(
                    getUpdatedMultiFilterModel(this.params.model, this.handlerWrappers.length, newModel, index),
                    additionalEventAttributes
                ),
            doesRowPassOtherFilter: (node) =>
                doesRowPassOtherFilter(node) &&
                this.doesFilterPass({ node, data: node.data, model: this.params.model, handlerParams }, index),
            getValue: updateGetValue(this.beans, params.column as AgColumn, this.filterDefs[index], getValue),
        };
        return handlerParams;
    }

    public doesFilterPass(params: DoesFilterPassParams<any, IMultiFilterModel>, indexToSkip?: number): boolean {
        const filterModels = params.model?.filterModels;
        if (filterModels == null) {
            return true;
        }
        return this.handlerWrappers.every((wrapper, index) => {
            const model = filterModels[index];
            if (model == null || (indexToSkip != null && index === indexToSkip)) {
                return true;
            }
            const handler = wrapper?.handler;
            return !handler || handler.doesFilterPass({ ...params, model, handlerParams: wrapper.handlerParams });
        });
    }

    private resetActiveList(model: IMultiFilterModel | null): void {
        this.activeFilterIndices = [];
        const filterModels = model?.filterModels;
        if (filterModels == null) {
            return;
        }
        for (let i = 0; i < this.handlerWrappers.length; i++) {
            const isActive = filterModels[i] != null;
            if (isActive) {
                this.activeFilterIndices.push(i);
            }
        }
    }

    public updateActiveList<TModel>(index: number, childModel: TModel | null): void {
        const activeFilterIndices = this.activeFilterIndices;

        _removeFromArray(activeFilterIndices, index);

        if (childModel != null) {
            activeFilterIndices.push(index);
        }
    }

    public getLastActiveFilterIndex(): number | null {
        const activeFilterIndices = this.activeFilterIndices;
        return activeFilterIndices.length > 0 ? activeFilterIndices[activeFilterIndices.length - 1] : null;
    }

    public getModelAsString(model: IMultiFilterModel | null): string {
        if (!model?.filterModels?.length) {
            return '';
        }
        const lastActiveIndex = this.getLastActiveFilterIndex() ?? 0;
        const activeWrapper = this.handlerWrappers[lastActiveIndex];
        return activeWrapper?.handler.getModelAsString?.(model.filterModels[lastActiveIndex]) ?? '';
    }

    public getHandler<TFilterHandler>(index: number): TFilterHandler | undefined {
        return this.handlerWrappers[index]?.handler as TFilterHandler;
    }

    public onAnyFilterChanged(): void {
        forEachReverse(this.handlerWrappers, (wrapper) => wrapper?.handler?.onAnyFilterChanged?.());
    }

    public onNewRowsLoaded(): void {
        forEachReverse(this.handlerWrappers, (wrapper) => wrapper?.handler?.onNewRowsLoaded?.());
    }

    public override destroy(): void {
        this.handlerWrappers.forEach((wrapper) => this.destroyBean(wrapper?.handler));
        this.handlerWrappers.length = 0;
        super.destroy();
    }
}
