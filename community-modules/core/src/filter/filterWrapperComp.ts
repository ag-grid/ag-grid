import type { ColumnModel } from '../columns/columnModel';
import type { BeanCollection } from '../context/context';
import type { InternalColumn } from '../entities/column';
import { Events } from '../eventKeys';
import type { FilterDestroyedEvent, FilterOpenedEvent } from '../events';
import type { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IFilterComp } from '../interfaces/iFilter';
import { _clearElement } from '../utils/dom';
import { _exists } from '../utils/generic';
import { AgPromise } from '../utils/promise';
import { Component } from '../widgets/component';
import type { FilterManager, FilterRequestSource, FilterWrapper } from './filterManager';

export class FilterWrapperComp extends Component {
    private filterManager: FilterManager;
    private columnModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.filterManager = beans.filterManager;
        this.columnModel = beans.columnModel;
    }

    private filterWrapper: FilterWrapper | null = null;

    constructor(
        private readonly column: InternalColumn,
        private readonly source: FilterRequestSource
    ) {
        super(/* html */ `<div class="ag-filter"></div>`);
    }

    public postConstruct(): void {
        this.createFilter(true);

        this.addManagedListener(this.eventService, Events.EVENT_FILTER_DESTROYED, this.onFilterDestroyed.bind(this));
    }

    public hasFilter(): boolean {
        return !!this.filterWrapper;
    }

    public getFilter(): AgPromise<IFilterComp> | null {
        return this.filterWrapper?.filterPromise ?? null;
    }

    public afterInit(): AgPromise<void> {
        return this.filterWrapper?.filterPromise?.then(() => {}) ?? AgPromise.resolve();
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        this.filterWrapper?.filterPromise?.then((filter) => {
            filter?.afterGuiAttached?.(params);
        });
    }

    public afterGuiDetached(): void {
        this.filterWrapper?.filterPromise?.then((filter) => {
            filter?.afterGuiDetached?.();
        });
    }

    private createFilter(init?: boolean): void {
        const { column, source } = this;
        this.filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, source);
        if (!this.filterWrapper?.filterPromise) {
            return;
        }
        this.filterWrapper.filterPromise.then((filter) => {
            const guiFromFilter = filter!.getGui();

            if (!_exists(guiFromFilter)) {
                console.warn(
                    `AG Grid: getGui method from filter returned ${guiFromFilter}; it should be a DOM element.`
                );
            }

            this.appendChild(guiFromFilter);
            if (init) {
                const event: WithoutGridCommon<FilterOpenedEvent> = {
                    type: Events.EVENT_FILTER_OPENED,
                    column,
                    source,
                    eGui: this.getGui(),
                };
                this.eventService.dispatchEvent(event);
            }
        });
    }

    private onFilterDestroyed(event: FilterDestroyedEvent): void {
        if (
            (event.source === 'api' || event.source === 'paramsUpdated') &&
            event.column.getId() === this.column.getId() &&
            this.columnModel.getColDefCol(this.column)
        ) {
            // filter has been destroyed by the API or params changing. If the column still exists, need to recreate UI component
            _clearElement(this.getGui());
            this.createFilter();
        }
    }

    public override destroy(): void {
        this.filterWrapper = null;
        super.destroy();
    }
}
