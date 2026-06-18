import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { Component, ComponentSelector } from '../widgets/component';
import { PaginationSelector } from './paginationComp';

const DEFAULT_PAGE_SIZE = 100;

export class PaginationService extends BeanStub implements NamedBean {
    beanName = 'pagination' as const;

    private active: boolean;
    private paginateChildRows: boolean;

    // We should track all the different sources of page size, as we can fall back to the next one if one is missing.
    // or if user preferences change (Example: disabling auto page size option should mean we get page size from
    // page size selector value - if a value was previously selected .. otherwise fall back to initial state value).
    // IMPORTANT: We should always use this.pageSize getter to get the page size instead of accessing
    // directly to these variables, as the getter takes care of returning the correct value based on precedence.
    private pageSizeAutoCalculated?: number; // When paginationAutoPageSize = true or when the pages panel is disabled
    private pageSizeFromPageSizeSelector?: number; // When user selects page size from page size selector.
    private pageSizeFromInitialState?: number; // When the initial grid state is loaded, and a page size rehydrated
    private pageSizeFromPanel?: number; // When the pageSize pagination panel config sets paginationPageSize.
    private pageSizeFromGridOptions?: number; // When user sets gridOptions.paginationPageSize.

    private totalPages: number;
    private currentPage = 0;

    private topDisplayedRowIndex = 0;
    private bottomDisplayedRowIndex = 0;

    private masterRowCount: number = 0;

    public postConstruct() {
        const gos = this.gos;
        this.active = gos.get('pagination');
        this.pageSizeFromGridOptions = gos.get('paginationPageSize');
        this.pageSizeFromPanel = this.getPanelPageSize();
        this.paginateChildRows = this.isPaginateChildRows();

        this.addManagedPropertyListener('pagination', this.onPaginationGridOptionChanged.bind(this));
        this.addManagedPropertyListener('paginationPageSize', this.onPageSizeGridOptionChanged.bind(this));
        this.addManagedPropertyListener('paginationPanels', this.onPanelsChanged.bind(this));
    }

    public getPaginationSelector(): ComponentSelector<Component> {
        return PaginationSelector;
    }

    private isPaginateChildRows(): boolean {
        const gos = this.gos;
        const shouldPaginate =
            gos.get('groupHideParentOfSingleChild') ||
            // following two properties deprecated v32.3.0
            gos.get('groupRemoveSingleChildren') ||
            gos.get('groupRemoveLowestSingleChildren');
        if (shouldPaginate) {
            return true;
        }
        return gos.get('paginateChildRows');
    }

    private onPaginationGridOptionChanged(): void {
        this.active = this.gos.get('pagination');
        this.calculatePages();

        // important to keep rendered rows, otherwise every time grid is resized,
        // we would destroy all the rows.
        this.dispatchPaginationChangedEvent({ keepRenderedRows: true });
    }

    private onPageSizeGridOptionChanged(): void {
        this.setPageSize(this.gos.get('paginationPageSize'), 'gridOptions');
    }

    private getPanelPageSize(): number | undefined {
        const panels = this.gos.get('paginationPanels');
        if (!panels) {
            return undefined;
        }
        for (let i = 0, len = panels.length; i < len; ++i) {
            const panel = panels[i];
            if (typeof panel === 'object' && panel.type === 'pageSize') {
                return panel.paginationPageSize;
            }
        }
        return undefined;
    }

    private onPanelsChanged(): void {
        const newPageSize = this.getPanelPageSize();
        if (newPageSize !== this.pageSizeFromPanel) {
            this.setPageSize(newPageSize, 'panel');
        }
    }

    public goToPage(page: number): void {
        const currentPage = this.currentPage;
        if (!this.active || currentPage === page || typeof currentPage !== 'number') {
            return;
        }

        const { editSvc } = this.beans;

        if (editSvc?.isEditing()) {
            if (editSvc.isBatchEditing()) {
                editSvc.cleanupEditors();
            } else {
                editSvc.stopEditing(undefined, { source: 'api' });
            }
        }

        this.currentPage = page;
        this.calculatePages();

        this.dispatchPaginationChangedEvent({ newPage: true });
    }

    public goToPageWithIndex(index: number): void {
        if (!this.active) {
            return;
        }

        let adjustedIndex = index;
        if (!this.paginateChildRows) {
            adjustedIndex = this.beans.rowModel.getTopLevelIndexFromDisplayedIndex?.(index) ?? index;
        }

        this.goToPage(Math.floor(adjustedIndex / this.pageSize));
    }

    public isRowInPage(rowIndex: number): boolean {
        if (!this.active) {
            return true;
        }
        return rowIndex >= this.topDisplayedRowIndex && rowIndex <= this.bottomDisplayedRowIndex;
    }

    public getCurrentPage(): number {
        return this.currentPage;
    }

    public goToNextPage(): void {
        this.goToPage(this.currentPage + 1);
    }

    public goToPreviousPage(): void {
        this.goToPage(this.currentPage - 1);
    }

    public goToFirstPage(): void {
        this.goToPage(0);
    }

    public goToLastPage(): void {
        const rowCount = this.beans.rowModel.getRowCount();
        const lastPage = Math.floor(rowCount / this.pageSize);
        this.goToPage(lastPage);
    }

    public getPageSize(): number {
        return this.pageSize;
    }

    public getTotalPages(): number {
        return this.totalPages;
    }

    /** This is only for state setting before data has been loaded */
    public setPage(page: number): void {
        this.currentPage = page;
    }

    private get pageSize(): number {
        const {
            pageSizeAutoCalculated,
            pageSizeFromInitialState,
            pageSizeFromPanel,
            pageSizeFromGridOptions,
            pageSizeFromPageSizeSelector,
            gos,
        } = this;

        // Explicitly check for autosize status as this can be set to false before the calculated value is cleared.
        // Due to a race condition in when event listeners are added.
        const autoValue = gos.get('paginationAutoPageSize') ? pageSizeAutoCalculated : undefined;
        return (
            autoValue ??
            pageSizeFromPageSizeSelector ??
            pageSizeFromInitialState ??
            pageSizeFromPanel ??
            pageSizeFromGridOptions ??
            DEFAULT_PAGE_SIZE
        );
    }

    public calculatePages(): void {
        if (this.active) {
            if (this.paginateChildRows) {
                this.calculatePagesAllRows();
            } else {
                this.calculatePagesMasterRowsOnly();
            }
        } else {
            this.calculatedPagesNotActive();
        }

        this.beans.pageBounds.calculateBounds(this.topDisplayedRowIndex, this.bottomDisplayedRowIndex);
    }

    public unsetAutoCalculatedPageSize(): void {
        if (this.pageSizeAutoCalculated === undefined) {
            return;
        }
        const oldPageSize = this.pageSizeAutoCalculated;

        this.pageSizeAutoCalculated = undefined;

        if (this.pageSize === oldPageSize) {
            return;
        }

        this.calculatePages();

        this.dispatchPaginationChangedEvent({ newPageSize: true });
    }

    public setPageSize(
        size: number | undefined,
        source: 'autoCalculated' | 'pageSizeSelector' | 'initialState' | 'panel' | 'gridOptions'
    ): void {
        const currentSize = this.pageSize;
        switch (source) {
            case 'autoCalculated':
                this.pageSizeAutoCalculated = size;
                break;
            case 'pageSizeSelector':
                this.pageSizeFromPageSizeSelector = size;
                if (this.currentPage !== 0) {
                    this.goToFirstPage();
                }
                break;
            case 'initialState':
                this.pageSizeFromInitialState = size;
                break;
            case 'panel':
                this.pageSizeFromPanel = size;
                this.applyExplicitPageSize(size);
                break;
            case 'gridOptions':
                this.pageSizeFromGridOptions = size;
                this.applyExplicitPageSize(size);
                break;
        }

        if (currentSize !== this.pageSize) {
            this.calculatePages();

            this.dispatchPaginationChangedEvent({ newPageSize: true, keepRenderedRows: true });
        }
    }

    // Only a concrete page size overrides the user's selector/initial-state choice. When the override
    // is removed (size undefined), keep those values so the previously selected page size is preserved.
    private applyExplicitPageSize(size: number | undefined): void {
        if (size === undefined) {
            return;
        }
        this.pageSizeFromInitialState = undefined;
        this.pageSizeFromPageSizeSelector = undefined;
        if (this.currentPage !== 0) {
            this.goToFirstPage();
        }
    }

    private setZeroRows(): void {
        this.masterRowCount = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = -1;
        this.currentPage = 0;
        this.totalPages = 0;
    }

    private adjustCurrentPageIfInvalid() {
        const totalPages = this.totalPages;
        if (this.currentPage >= totalPages) {
            this.currentPage = totalPages - 1;
        }

        const currentPage = this.currentPage;

        if (!isFinite(currentPage) || isNaN(currentPage) || currentPage < 0) {
            this.currentPage = 0;
        }
    }

    private calculatePagesMasterRowsOnly(): void {
        const rowModel = this.beans.rowModel;

        const masterRowCount = rowModel.getTopLevelRowCount();
        this.masterRowCount = masterRowCount;

        // we say <=0 (rather than =0) as viewport returns -1 when no rows
        if (masterRowCount <= 0) {
            this.setZeroRows();
            return;
        }

        const pageSize = this.pageSize;

        const masterLastRowIndex = masterRowCount - 1;
        this.totalPages = Math.floor(masterLastRowIndex / pageSize) + 1;

        this.adjustCurrentPageIfInvalid();

        const currentPage = this.currentPage;

        const masterPageStartIndex = pageSize * currentPage;
        let masterPageEndIndex = pageSize * (currentPage + 1) - 1;

        if (masterPageEndIndex > masterLastRowIndex) {
            masterPageEndIndex = masterLastRowIndex;
        }

        this.topDisplayedRowIndex = rowModel.getTopLevelRowDisplayedIndex(masterPageStartIndex);

        if (masterPageEndIndex === masterLastRowIndex) {
            // if showing the last master row, then we want to show the very last row of the model
            this.bottomDisplayedRowIndex = rowModel.getRowCount() - 1;
        } else {
            const firstIndexNotToShow = rowModel.getTopLevelRowDisplayedIndex(masterPageEndIndex + 1);
            // this gets the index of the last child - eg current row is open, we want to display all children,
            // the index of the last child is one less than the index of the next parent row.
            this.bottomDisplayedRowIndex = firstIndexNotToShow - 1;
        }
    }

    public getMasterRowCount(): number {
        return this.masterRowCount;
    }

    private calculatePagesAllRows(): void {
        const masterRowCount = this.beans.rowModel.getRowCount();
        this.masterRowCount = masterRowCount;

        if (masterRowCount === 0) {
            this.setZeroRows();
            return;
        }

        const { pageSize, currentPage } = this;
        const maxRowIndex = masterRowCount - 1;
        this.totalPages = Math.floor(maxRowIndex / pageSize) + 1;

        this.adjustCurrentPageIfInvalid();

        this.topDisplayedRowIndex = pageSize * currentPage;
        this.bottomDisplayedRowIndex = pageSize * (currentPage + 1) - 1;

        if (this.bottomDisplayedRowIndex > maxRowIndex) {
            this.bottomDisplayedRowIndex = maxRowIndex;
        }
    }

    private calculatedPagesNotActive(): void {
        // when pagination is not active we don't use any page size variables,
        // however need to unset this so if enabled we recalculate.
        this.setPageSize(undefined, 'autoCalculated');
        this.totalPages = 1;
        this.currentPage = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = this.beans.rowModel.getRowCount() - 1;
    }

    private dispatchPaginationChangedEvent(params: {
        newPage?: boolean;
        newPageSize?: boolean;
        keepRenderedRows?: boolean;
    }): void {
        const { keepRenderedRows = false, newPage = false, newPageSize = false } = params;
        this.eventSvc.dispatchEvent({
            type: 'paginationChanged',
            animate: false,
            newData: false,
            newPage,
            newPageSize,
            keepRenderedRows,
        });
    }
}
