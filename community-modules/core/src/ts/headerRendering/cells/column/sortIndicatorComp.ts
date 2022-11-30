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

    constructor(skipTemplate?: boolean) {
        super();

        if (!skipTemplate) {
            this.setTemplate(SortIndicatorComp.TEMPLATE);
        }
    }

    public attachCustomElements(
        eSortOrder: HTMLElement,
        eSortAsc: HTMLElement,
        eSortDesc: HTMLElement,
        eSortMixed: HTMLElement,
        eSortNone: HTMLElement
    ) {
        this.eSortOrder = eSortOrder;
        this.eSortAsc = eSortAsc;
        this.eSortDesc = eSortDesc;
        this.eSortMixed = eSortMixed;
        this.eSortNone = eSortNone;
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

        const eIcon = createIconNoSpan(iconName, this.gridOptionsService, column);
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
        const sortDirection = this.sortController.getDisplaySortForColumn(this.column);

        if (this.eSortAsc) {
            const isAscending = sortDirection === 'asc';
            setDisplayed(this.eSortAsc, isAscending, { skipAriaHidden: true });
        }

        if (this.eSortDesc) {
            const isDescending = sortDirection === 'desc';
            setDisplayed(this.eSortDesc, isDescending, { skipAriaHidden: true });
        }

        if (this.eSortNone) {
            const alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsService.is('unSortIcon');
            const isNone = sortDirection === null || sortDirection === undefined;
            setDisplayed(this.eSortNone, !alwaysHideNoSort && isNone, { skipAriaHidden: true });
        }
    }

    private setupMultiSortIndicator() {
        this.addInIcon('sortUnSort', this.eSortMixed, this.column);

        const isColumnShowingRowGroup = this.column.getColDef().showRowGroup;
        const areGroupsCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        if (areGroupsCoupled && isColumnShowingRowGroup) {
            // Watch global events, as row group columns can effect their display column.
            this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, () => this.updateMultiSortIndicator());
            // when grouping changes so can sort indexes and icons
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED,  () => this.updateMultiSortIndicator());
            this.updateMultiSortIndicator();
        }
    }

    private updateMultiSortIndicator() {
        if (this.eSortMixed) {
            const isMixedSort = this.sortController.getDisplaySortForColumn(this.column) === 'mixed';
            setDisplayed(this.eSortMixed, isMixedSort, { skipAriaHidden: true });
        }
    }

    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    private updateSortOrder(): void {
        if (!this.eSortOrder) { return; }

        const allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();

        const indexThisCol = this.sortController.getDisplaySortIndexForColumn(this.column) ?? -1;
        const moreThanOneColSorting = allColumnsWithSorting.some(col => this.sortController.getDisplaySortIndexForColumn(col) ?? -1 >= 1);
        const showIndex = indexThisCol >= 0 && moreThanOneColSorting;
        setDisplayed(this.eSortOrder, showIndex, { skipAriaHidden: true });

        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        } else {
            clearElement(this.eSortOrder);
        }
    }

}
