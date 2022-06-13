import { Events } from "../../../eventKeys";
import { SortController } from "../../../sortController";
import { setDisplayed, clearElement } from "../../../utils/dom";
import { Autowired } from "../../../context/context";
import { Column } from "../../../entities/column";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { Component } from "../../../widgets/component";
import { ColumnModel } from "../../../columns/columnModel";
import { createIconNoSpan } from "../../../utils/icon";

export class SortIndicatorComp extends Component {

    private static TEMPLATE = /* html */
        `<span class="ag-sort-indicator-container">
            <span ref="eSortOrder" class="ag-sort-indicator-icon ag-sort-order ag-hidden" aria-hidden="true"></span>
            <span ref="eSortAsc" class="ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden" aria-hidden="true"></span>
            <span ref="eSortDesc" class="ag-sort-indicator-icon ag-sort-descending-icon ag-hidden" aria-hidden="true"></span>
            <span ref="eSortMixed" class="ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden" aria-hidden="true"></span>
            <span ref="eSortNone" class="ag-sort-indicator-icon ag-sort-none-icon ag-hidden" aria-hidden="true"></span>
        </span>`;

    @RefSelector('eSortOrder') private eSortOrder: HTMLElement;
    @RefSelector('eSortAsc') private eSortAsc: HTMLElement;
    @RefSelector('eSortDesc') private eSortDesc: HTMLElement;
    @RefSelector('eSortMixed') private eSortMixed: HTMLElement;
    @RefSelector('eSortNone') private eSortNone: HTMLElement;

    @Autowired('columnModel')  private readonly columnModel: ColumnModel;
    @Autowired('sortController')  private readonly sortController: SortController;

    private column: Column;
    private suppressOrder: boolean;

    constructor() {
        super();

        this.setTemplate(SortIndicatorComp.TEMPLATE);
    }

    public setupSort(column: Column, suppressOrder: boolean = false): void {
        this.column = column;
        this.suppressOrder = suppressOrder;
        
        this.setupMultiSortIndicator();

        const canSort = !!this.column.getColDef().sortable;
        if (!canSort) {
            return;
        }

        this.addInIcon('sortAscending', this.eSortAsc, column);
        this.addInIcon('sortDescending', this.eSortDesc, column);
        this.addInIcon('sortUnSort', this.eSortNone, column);

        // Watch global events, as row group columns can effect their display column.
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED,  () => this.onSortChanged());
        // when grouping changes so can sort indexes and icons
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED,  () => this.onSortChanged());

        this.onSortChanged();
    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: Column): void {
        if (eParent == null) { return; }

        const eIcon = createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }

    private onSortChanged(): void {
        this.updateIcons();
        if (!this.suppressOrder) {
            this.updateSortOrder();
        }
    }

    private updateIcons(): void {
        const isColumnCoupled = this.isColumnCoupled();

        const sortDirection = isColumnCoupled ? this.getGroupSortDirection() : this.column.getSort();

        if (this.eSortAsc) {
            const isAscending = sortDirection === 'asc';
            this.eSortAsc.classList.toggle('ag-hidden', !isAscending);
        }

        if (this.eSortDesc) {
            const isDescending = sortDirection === 'desc';
            this.eSortDesc.classList.toggle('ag-hidden', !isDescending);
        }

        if (this.eSortNone) {
            const alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            const isNone = sortDirection === null || sortDirection === undefined;
            this.eSortNone.classList.toggle('ag-hidden', (alwaysHideNoSort || !isNone));
        }
    }

    private setupMultiSortIndicator() {
        this.addInIcon('sortUnSort', this.eSortMixed, this.column);
    
        const isColumnShowingRowGroup = this.column.getColDef().showRowGroup;
        const areGroupsCoupled = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        if (areGroupsCoupled && isColumnShowingRowGroup) {
            // Watch global events, as row group columns can effect their display column.
            this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, () => this.updateMultiSortIndicator());
            // when grouping changes so can sort indexes and icons
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED,  () => this.updateMultiSortIndicator());
            this.updateMultiSortIndicator();
        }
    }

    private isColumnCoupled() {
        const areGroupsCoupled = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        const isColumnGroupDisplay = !!this.column.getColDef().showRowGroup;
        return areGroupsCoupled && isColumnGroupDisplay;
    }

    private getGroupSortDirection(): 'asc' | 'desc' | 'mixed' | null | undefined {
        const columnHasUniqueData = this.column.getColDef().field;
        const linkedColumns = this.columnModel.getSourceColumnsForGroupColumn(this.column);
        if (!linkedColumns) {
            return this.column.getSort();
        }
        const sortableColumns = columnHasUniqueData ? [this.column, ...linkedColumns] : linkedColumns;

        if (sortableColumns.length === 0) {
            return undefined;
        }
        const firstSort = sortableColumns[0].getSort();
        const allMatch = sortableColumns.every(col => col.getSort() === firstSort);
        if (!allMatch) {
            return 'mixed';
        }
        return firstSort;
    }

    private updateMultiSortIndicator() {
        if (this.eSortMixed) {
            const isMixedSort = this.isColumnCoupled() && this.getGroupSortDirection() === 'mixed';
            this.eSortMixed.classList.toggle('ag-hidden', !isMixedSort);
        }
    }

    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    private updateSortOrder(): void {
        if (!this.eSortOrder) { return; }

        const allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();

        const indexThisCol = this.column.getSortIndex() ?? -1;
        const moreThanOneColSorting = allColumnsWithSorting.some(col => col.getSortIndex() ?? -1 >= 1);
        const showIndex = this.column.isSorting() && moreThanOneColSorting;

        setDisplayed(this.eSortOrder, showIndex);

        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        } else {
            clearElement(this.eSortOrder);
        }
    }

}
