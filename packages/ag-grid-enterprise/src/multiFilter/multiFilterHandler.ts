import { _removeFromArray } from 'ag-stack';

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
import { BeanStub } from 'ag-grid-community';

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
    /** Used to get the filter type for filter models. */
    public readonly filterType = 'multi' as const;

    private params: FilterHandlerParams<any, any, IMultiFilterModel, IMultiFilterParams>;
    private readonly handlerWrappers: (HandlerWrapper | undefined)[] = [];
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
                this.warn(278, { colId: params.column.getColId() });
                return;
            }
            const { handler, handlerParams } = wrapper;
            handler.init?.({
                ...this.updateHandlerParams(handlerParams, index, true),
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
                const updatedParams = this.updateHandlerParams(params, index, false, filters?.[index].filterParams);
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
        // Floating filter changes bypass MultiFilterUi (whose onModelChange triggers sibling
        // notification for the 'ui' source). Cross-column onAnyFilterChanged notification skips
        // the active column, so siblings within this Multi Filter would otherwise never refresh.
        if (params.additionalEventAttributes?.fromButtons || params.source === 'floating') {
            this.onAnyFilterChanged();
        }
    }

    private updateHandlerParams(
        params: FilterHandlerBaseParams,
        index: number,
        isInit: boolean,
        providedFilterParams?: any
    ): FilterHandlerBaseParams {
        const { onModelChange, doesRowPassOtherFilter, getValue } = params;
        const handlerParams: FilterHandlerBaseParams = {
            ...params,
            onModelChange: (newModel, additionalEventAttributes) =>
                onModelChange(
                    getUpdatedMultiFilterModel(this.params.model, this.handlerWrappers.length, newModel, index),
                    additionalEventAttributes
                ),
            doesRowPassOtherFilter: (node) =>
                doesRowPassOtherFilter(node) &&
                this.doesFilterPass({ node, data: node.data, model: this.params.model, handlerParams }, index),
            getValue: updateGetValue(this.beans, params.column as AgColumn, this.filterDefs[index], getValue),
            filterParams: this.updateFilterParams(params, isInit, providedFilterParams),
        };
        return handlerParams;
    }

    private updateFilterParams(params: FilterHandlerBaseParams, isInit: boolean, providedFilterParams?: any): any {
        const originalFilterParams = params.filterParams;
        if (providedFilterParams?.buttons && isInit) {
            this.warn(292, { colId: params.column.getColId() });
        }
        const filterParamsForFilter = providedFilterParams
            ? { ...originalFilterParams, ...providedFilterParams }
            : originalFilterParams;
        if (!filterParamsForFilter.buttons) {
            return filterParamsForFilter;
        }
        if (providedFilterParams) {
            delete filterParamsForFilter.buttons;
            return filterParamsForFilter;
        }
        const { buttons: _, ...filterParamsForFilterWithoutButtons } = filterParamsForFilter;
        return filterParamsForFilterWithoutButtons;
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

    public getModelAsString(model: IMultiFilterModel | null, source?: 'floating' | 'filterToolPanel'): string {
        const isForToolPanel = source === 'filterToolPanel';
        const defaultOption = () =>
            isForToolPanel ? this.getLocaleTextFunc()('filterSummaryInactive', 'is (All)') : '';
        if (!model?.filterModels?.length) {
            return defaultOption();
        }
        const lastActiveIndex = this.getLastActiveFilterIndex() ?? 0;
        const activeWrapper = this.handlerWrappers[lastActiveIndex];
        return (
            activeWrapper?.handler.getModelAsString?.(model.filterModels[lastActiveIndex], source) ?? defaultOption()
        );
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
        for (const wrapper of this.handlerWrappers) {
            this.destroyBean(wrapper?.handler);
        }
        this.handlerWrappers.length = 0;
        super.destroy();
    }
}
