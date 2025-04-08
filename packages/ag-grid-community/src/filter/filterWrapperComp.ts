import type { AgColumn } from '../entities/agColumn';
import type { FilterDestroyedEvent } from '../events';
import type { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import type { IFilterComp } from '../interfaces/iFilter';
import type { ElementParams } from '../utils/dom';
import { _clearElement } from '../utils/dom';
import { _exists } from '../utils/generic';
import { AgPromise } from '../utils/promise';
import { _warn } from '../validation/logging';
import { Component } from '../widgets/component';
import type { FilterDisplayWrapper } from './columnFilterService';
import { FilterDisplayComp } from './filterDisplayComp';
import type { FilterRequestSource } from './iColumnFilter';

const FilterWrapperElement: ElementParams = { tag: 'div', cls: 'ag-filter' };

export class FilterWrapperComp extends Component {
    private filterWrapper: AgPromise<FilterDisplayWrapper> | null = null;
    private displayComp?: FilterDisplayComp;

    constructor(
        private readonly column: AgColumn,
        private readonly source: FilterRequestSource
    ) {
        super(FilterWrapperElement);
    }

    public postConstruct(): void {
        this.createFilter(true);

        this.addManagedEventListeners({ filterDestroyed: this.onFilterDestroyed.bind(this) });
    }

    public hasFilter(): boolean {
        return this.filterWrapper != null;
    }

    public getFilter(): AgPromise<IFilterComp> | null {
        return this.filterWrapper?.then((wrapper) => wrapper!.comp as any) ?? null;
    }

    public afterInit(): AgPromise<void> {
        return this.filterWrapper?.then(() => {}) ?? AgPromise.resolve();
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        this.filterWrapper?.then((wrapper) => {
            this.displayComp?.afterGuiAttached(params);
            wrapper?.comp?.afterGuiAttached?.(params);
        });
    }

    public afterGuiDetached(): void {
        this.filterWrapper?.then((wrapper) => {
            wrapper?.comp?.afterGuiDetached?.();
        });
    }

    private createFilter(init?: boolean): void {
        const {
            column,
            source,
            beans: { colFilter },
        } = this;
        const filterPromise = this.beans.colFilter?.getFilterUiForDisplay(column) ?? null;
        this.filterWrapper = filterPromise;
        filterPromise?.then((wrapper) => {
            if (!wrapper) {
                return;
            }
            const { isEvaluator, comp } = wrapper;
            let filterGui: HTMLElement;
            if (isEvaluator) {
                const displayComp = this.createBean(
                    new FilterDisplayComp(column, wrapper, colFilter!, colFilter!.updateModel.bind(colFilter))
                );
                this.displayComp = displayComp;
                filterGui = displayComp.getGui();
            } else {
                filterGui = comp.getGui();

                if (!_exists(filterGui)) {
                    _warn(69, { guiFromFilter: filterGui });
                }
            }
            this.appendChild(filterGui);
            if (init) {
                this.eventSvc.dispatchEvent({
                    type: 'filterOpened',
                    column,
                    source,
                    eGui: this.getGui(),
                });
            }
        });
    }

    private onFilterDestroyed(event: FilterDestroyedEvent): void {
        if (
            (event.source === 'api' || event.source === 'paramsUpdated') &&
            event.column.getId() === this.column.getId() &&
            this.beans.colModel.getColDefCol(this.column)
        ) {
            // filter has been destroyed by the API or params changing. If the column still exists, need to recreate UI component
            _clearElement(this.getGui());
            this.displayComp = this.destroyBean(this.displayComp);
            this.createFilter();
        }
    }

    public override destroy(): void {
        this.filterWrapper = null;
        this.displayComp = this.destroyBean(this.displayComp);
        super.destroy();
    }
}
