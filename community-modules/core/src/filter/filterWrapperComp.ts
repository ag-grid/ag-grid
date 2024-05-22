import { ColumnModel } from '../columns/columnModel';
import { Autowired } from '../context/context';
import { Column } from '../entities/column';
import { Events } from '../eventKeys';
import { FilterDestroyedEvent, FilterOpenedEvent } from '../events';
import { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import { WithoutGridCommon } from '../interfaces/iCommon';
import { IFilterComp } from '../interfaces/iFilter';
import { _clearElement } from '../utils/dom';
import { _exists } from '../utils/generic';
import { AgPromise } from '../utils/promise';
import { Component } from '../widgets/component';
import { FilterManager, FilterRequestSource, FilterWrapper } from './filterManager';

export class FilterWrapperComp extends Component {
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private filterWrapper: FilterWrapper | null = null;

    constructor(
        private readonly column: Column,
        private readonly source: FilterRequestSource
    ) {
        super(/* html */ `<div class="ag-filter"></div>`);
    }

    public override postConstruct(): void {
        super.postConstruct();
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
