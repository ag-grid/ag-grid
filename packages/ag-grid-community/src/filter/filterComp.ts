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
import { FilterWrapperComp } from './filterWrapperComp';
import type { FilterRequestSource } from './iColumnFilter';

const FilterElement: ElementParams = { tag: 'div', cls: 'ag-filter' };

/** Wraps column filters for use in menus, tool panel etc. */
export class FilterComp extends Component {
    private wrapper: AgPromise<FilterDisplayWrapper> | null = null;
    private comp?: FilterWrapperComp;

    constructor(
        private readonly column: AgColumn,
        private readonly source: FilterRequestSource,
        private readonly enableGlobalButtonCheck?: boolean
    ) {
        super(FilterElement);
    }

    public postConstruct(): void {
        this.createFilter(true);

        this.addManagedEventListeners({ filterDestroyed: this.onFilterDestroyed.bind(this) });
    }

    public hasFilter(): boolean {
        return this.wrapper != null;
    }

    public getFilter(): AgPromise<IFilterComp> | null {
        return this.wrapper?.then((wrapper) => wrapper!.comp as any) ?? null;
    }

    public afterInit(): AgPromise<void> {
        return this.wrapper?.then(() => {}) ?? AgPromise.resolve();
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        this.wrapper?.then((wrapper) => {
            this.comp?.afterGuiAttached(params);
            wrapper?.comp?.afterGuiAttached?.(params);
        });
    }

    public afterGuiDetached(): void {
        this.wrapper?.then((wrapper) => {
            wrapper?.comp?.afterGuiDetached?.();
        });
    }

    private createFilter(init?: boolean): void {
        const {
            column,
            source,
            beans: { colFilter },
        } = this;
        const filterPromise = colFilter!.getFilterUiForDisplay(column) ?? null;
        this.wrapper = filterPromise;
        filterPromise?.then((wrapper) => {
            if (!wrapper) {
                return;
            }
            const { isHandler, comp } = wrapper;
            let filterGui: HTMLElement;
            if (isHandler) {
                const enableGlobalButtonCheck = !!this.enableGlobalButtonCheck;
                const displayComp = this.createBean(
                    new FilterWrapperComp(
                        column,
                        wrapper,
                        colFilter!,
                        colFilter!.updateModel.bind(colFilter),
                        enableGlobalButtonCheck && colFilter!.isGlobalButtons,
                        enableGlobalButtonCheck
                    )
                );
                this.comp = displayComp;
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
        const { source, column } = event;
        if (
            (source === 'api' || source === 'paramsUpdated') &&
            column.getId() === this.column.getId() &&
            this.beans.colModel.getColDefCol(this.column)
        ) {
            // filter has been destroyed by the API or params changing. If the column still exists, need to recreate UI component
            _clearElement(this.getGui());
            this.comp = this.destroyBean(this.comp);
            this.createFilter();
        }
    }

    public override destroy(): void {
        this.wrapper = null;
        this.comp = this.destroyBean(this.comp);
        super.destroy();
    }
}
