import { _removeFromArray } from 'ag-stack';

import type {
    AgColumn,
    AgFilterHandlerBaseParams,
    AgFilterHandlerParams,
    DoesFilterPassParams,
    FilterGetValueFunc,
    FilterHandler,
    IMultiFilterDef,
    MultiFilterHandler as IMultiFilterHandler,
    IMultiFilterModel,
    IMultiFilterParams,
} from 'ag-grid-community';
import { BeanStub, _getDisplayHandler, _getRowHandler, _resolveFilter } from 'ag-grid-community';

import {
    DEFAULT_CHILD_FILTER,
    forEachReverse,
    getFilterModelForIndex,
    getMultiFilterDefs,
    getUpdatedMultiFilterModel,
    multiFilterChildrenChanged,
} from './multiFilterUtil';

interface HandlerWrapper {
    handler: FilterHandler;
    handlerParams: AgFilterHandlerBaseParams;
}

export class MultiFilterHandler
    extends BeanStub
    implements FilterHandler<any, any, IMultiFilterModel, IMultiFilterParams>, IMultiFilterHandler
{
    /** Used to get the filter type for filter models. */
    public readonly filterType = 'multi' as const;

    private params: AgFilterHandlerParams<any, any, IMultiFilterModel, IMultiFilterParams>;
    private readonly handlerWrappers: (HandlerWrapper | undefined)[] = [];
    /** ui active. could still have null model */
    private activeFilterIndices: number[] = [];
    private filterDefs: IMultiFilterDef[] = [];

    public init(params: AgFilterHandlerParams<any, any, IMultiFilterModel, IMultiFilterParams>): void {
        this.params = params;

        const filterDefs = getMultiFilterDefs(params.filterParams);
        this.filterDefs = filterDefs;
        const { beans, handlerWrappers } = this;
        const colFilter = beans.colFilter!;
        const column = params.column as AgColumn;
        for (let index = 0, len = filterDefs.length; index < len; ++index) {
            const wrapper = colFilter.createHandler(
                column,
                _resolveFilter(beans, column, filterDefs[index], DEFAULT_CHILD_FILTER, params)
            );
            handlerWrappers.push(wrapper);
            if (!wrapper) {
                this.warn(278, { colId: column.getColId() });
                continue;
            }
            const handlerParams = this.updateHandlerParams(wrapper.handlerParams, index);
            wrapper.handlerParams = handlerParams;
            wrapper.handler.init?.({
                ...handlerParams,
                model: getFilterModelForIndex(params.model, index),
                source: 'init',
            });
        }
        this.resetActiveList(params.model);
    }

    public refresh(params: AgFilterHandlerParams<any, any, IMultiFilterModel, IMultiFilterParams>): boolean {
        const { source, additionalEventAttributes } = params;
        const isColDef = source === 'colDef';
        if (isColDef) {
            const newDefs = getMultiFilterDefs(params.filterParams);
            if (multiFilterChildrenChanged(this.filterDefs, newDefs)) {
                return false;
            }
            this.filterDefs = newDefs;
        }
        this.params = params;
        const { beans, handlerWrappers } = this;
        const colFilter = beans.colFilter!;
        const column = params.column as AgColumn;
        for (let i = 0, len = handlerWrappers.length; i < len; ++i) {
            const wrapper = handlerWrappers[i];
            if (!wrapper) {
                continue;
            }
            // only a column definition gives a child new params, so a later one keeps its own until its turn
            if (isColDef) {
                wrapper.handlerParams = this.updateHandlerParams(
                    colFilter.createHandlerParamsForDef(
                        column,
                        _resolveFilter(beans, column, this.filterDefs[i], DEFAULT_CHILD_FILTER, params)
                    ),
                    i
                );
            }
            // read each time, as a child reconciling its model refreshes this filter with the new one
            const model = getFilterModelForIndex(this.params.model, i);
            const refreshed = wrapper.handler.refresh?.({
                ...wrapper.handlerParams,
                model,
                source,
                additionalEventAttributes,
            });
            // a child cannot be rebuilt on its own, so one refusing the new params recreates the whole handler
            if (refreshed === false && isColDef) {
                return false;
            }
        }
        if (source !== 'floating' && source !== 'ui') {
            this.resetActiveList(this.params.model);
        }
        // Floating filter changes bypass MultiFilterUi (whose onModelChange triggers sibling
        // notification for the 'ui' source). Cross-column onAnyFilterChanged notification skips
        // the active column, so siblings within this Multi Filter would otherwise never refresh.
        if (additionalEventAttributes?.fromButtons || source === 'floating') {
            this.onAnyFilterChanged();
        }
        return true;
    }

    /** Wraps a child's own params, as the column's filter would build them, to feed this filter's model. */
    private updateHandlerParams(params: AgFilterHandlerBaseParams, index: number): AgFilterHandlerBaseParams {
        const onModelChange = params.onModelChange;
        // the Multi Filter applies its children, so a child's own buttons do not
        const { buttons: _, ...filterParams } = params.filterParams;
        const handlerParams: AgFilterHandlerBaseParams = {
            ...params,
            onModelChange: (newModel, additionalEventAttributes) =>
                onModelChange(
                    getUpdatedMultiFilterModel(this.params.model, this.handlerWrappers.length, newModel, index),
                    additionalEventAttributes
                ),
            // the siblings count as other filters, through the tree as the other columns do
            doesRowPassOtherFilter: this.beans.colFilter!.createDoesRowPassOtherFilter(
                params.column as AgColumn,
                (node) => this.doesFilterPass({ node, data: node.data, model: this.params.model, handlerParams }, index)
            ),
            filterParams,
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
        return _getRowHandler(this.handlerWrappers[index]?.handler) as TFilterHandler;
    }

    /** The handler a child's UI works with, its own where the child's rows follow the author's logic. */
    public getChildDisplayHandler<TFilterHandler>(index: number): TFilterHandler | undefined {
        return _getDisplayHandler(this.handlerWrappers[index]?.handler) as TFilterHandler;
    }

    public onChildAnyFilterChanged(index: number): void {
        this.handlerWrappers[index]?.handler.onAnyFilterChanged?.();
    }

    /** A child's ui reads the rows as its handler does. */
    public getChildGetValue(index: number): FilterGetValueFunc | undefined {
        return this.handlerWrappers[index]?.handlerParams.getValue;
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
