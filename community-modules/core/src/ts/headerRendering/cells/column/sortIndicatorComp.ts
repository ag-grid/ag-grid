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

    constructor() {
        super();

        this.setTemplate(SortIndicatorComp.TEMPLATE);
    }

    public setupSort(column: Column): void {
        this.column = column;
        
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
        this.updateSortOrder();
    }

    private updateIcons(): void {
        const isMixedSort = this.isColumnMixedSorting();
        const isAscending = !isMixedSort && this.column.isSortAscending();
        const isDescending = !isMixedSort && this.column.isSortDescending();
        const isNone = !isMixedSort && this.column.isSortNone();

        if (this.eSortAsc) {
            this.eSortAsc.classList.toggle('ag-hidden', !isAscending);
        }

        if (this.eSortDesc) {
            this.eSortDesc.classList.toggle('ag-hidden', !isDescending);
        }

        if (this.eSortNone) {
            const alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            this.eSortNone.classList.toggle('ag-hidden', (alwaysHideNoSort || !isNone));
        }
    }

    private setupMultiSortIndicator() {
        this.addInIcon('sortUnSort', this.eSortMixed, this.column);
    
        // We only enable the mixed indicator for CSRM, as we know we always sort groups first.
        const isColumnShowingRowGroup = this.column.getColDef().showRowGroup;
        const isClientSideRowModel = this.gridOptionsWrapper.isRowModelDefault();
        if (isClientSideRowModel && isColumnShowingRowGroup) {
            // Watch global events, as row group columns can effect their display column.
            this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, () => this.updateMultiSortIndicator());
            // when grouping changes so can sort indexes and icons
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED,  () => this.updateMultiSortIndicator());
            this.updateMultiSortIndicator();
        }
    }

    private isColumnMixedSorting() {
        const isClientSideRowModel = this.gridOptionsWrapper.isRowModelDefault();
        if (!isClientSideRowModel) {
            return false;
        }

        if (!this.column.getColDef().showRowGroup) {
            return false;
        }
        const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.column);
        // this == is intentional, as it allows null and undefined to match, which are both unsorted states
        const sortDirectionsMatch = sourceColumns?.every(sourceCol => this.column.getSort() == sourceCol.getSort());

        const isMultiSorting = !sortDirectionsMatch;
        return isMultiSorting;
    }

    private updateMultiSortIndicator() {
        if (this.eSortMixed) {
            this.eSortMixed.classList.toggle('ag-hidden', !this.isColumnMixedSorting());
        }
    }

    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    private updateSortOrder(): void {
        if (!this.eSortOrder) { return; }

        const allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();
        const notRowGroupColumnsWithSorting = allColumnsWithSorting.filter(sortedCol => !this.columnModel.getGroupDisplayColumnForGroup(sortedCol.getId()));

        const isClientSideRowModel = this.gridOptionsWrapper.isRowModelDefault();
        const indexableColumns = isClientSideRowModel ? notRowGroupColumnsWithSorting : allColumnsWithSorting;

        const colIsNotRowGroup = !this.columnModel.getGroupDisplayColumnForGroup(this.column.getId());
        const indexThisCol = indexableColumns.indexOf(this.column);
        const moreThanOneColSorting = indexableColumns.length > 1;
        const showIndex = this.column.isSorting() && moreThanOneColSorting && (!isClientSideRowModel || colIsNotRowGroup);

        setDisplayed(this.eSortOrder, showIndex);

        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        } else {
            clearElement(this.eSortOrder);
        }
    }

}
