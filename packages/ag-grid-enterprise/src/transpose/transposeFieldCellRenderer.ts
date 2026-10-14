import { RefPlaceholder } from 'ag-stack';

import type { AgColumn, ElementParams, ICellRendererComp, ICellRendererParams, RowNode } from 'ag-grid-community';
import { Component, _createIconNoSpan } from 'ag-grid-community';

import type { TransposeService } from './transposeService';

const INDENT_PX = 16;

const TransposeFieldCellElement: ElementParams = {
    tag: 'span',
    cls: 'ag-transpose-field',
    children: [
        { tag: 'span', ref: 'eExpand', cls: 'ag-transpose-field-expand' },
        { tag: 'span', ref: 'eLabel', cls: 'ag-transpose-field-label' },
        { tag: 'span', ref: 'eSort', cls: 'ag-transpose-field-button ag-transpose-field-sort' },
        { tag: 'span', ref: 'eFilter', cls: 'ag-transpose-field-button ag-transpose-field-filter' },
    ],
};

/** Field-name cell: indents and expands field groups; on a field row, sorts and filters the records by that field. */
export class TransposeFieldCellRenderer extends Component implements ICellRendererComp {
    private readonly eExpand: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eSort: HTMLElement = RefPlaceholder;
    private readonly eFilter: HTMLElement = RefPlaceholder;
    private params: ICellRendererParams | null = null;

    constructor() {
        super(TransposeFieldCellElement);
    }

    public init(params: ICellRendererParams): void {
        this.addManagedElementListeners(this.eExpand, { click: () => this.toggle() });
        this.addManagedElementListeners(this.eSort, { click: (event: MouseEvent) => this.onSortClicked(event) });
        this.addManagedElementListeners(this.eFilter, { click: () => this.onFilterClicked() });
        this.addManagedEventListeners({
            sortChanged: () => this.refreshButtons(),
            filterChanged: () => this.refreshButtons(),
        });
        this.render(params);
    }

    public refresh(params: ICellRendererParams): boolean {
        this.render(params);
        return true;
    }

    private get transposeSvc(): TransposeService {
        return this.beans.transposeSvc as TransposeService;
    }

    private get fieldCol(): AgColumn | undefined {
        return (this.params?.node as RowNode | undefined)?.transposeFieldCol;
    }

    private render(params: ICellRendererParams): void {
        this.params = params;
        const rowNode = params.node as RowNode;
        const transposeSvc = this.transposeSvc;
        const isGroup = transposeSvc.isFieldGroupRow(rowNode);

        this.getGui().style.paddingInlineStart = `${(rowNode.uiLevel ?? 0) * INDENT_PX}px`;
        this.toggleCss('ag-transpose-field-group', isGroup);
        this.eLabel.textContent = params.value ?? '';

        const eExpand = this.eExpand;
        eExpand.replaceChildren();
        if (isGroup && transposeSvc.isFieldGroupExpandable(rowNode)) {
            const icon = _createIconNoSpan(
                transposeSvc.isFieldGroupExpanded(rowNode) ? 'groupExpanded' : 'groupContracted',
                this.beans
            );
            if (icon) {
                eExpand.appendChild(icon);
            }
        }
        this.refreshButtons();
    }

    private refreshButtons(): void {
        const fieldCol = this.fieldCol;
        const colDef = fieldCol?.colDef;
        const sortable = !!fieldCol && colDef!.sortable !== false;
        const filterable = !!fieldCol && !!colDef!.filter;

        const { eSort, eFilter } = this;
        eSort.replaceChildren();
        eFilter.replaceChildren();
        if (sortable) {
            const sort = fieldCol.getSort();
            let iconName: 'sortAscending' | 'sortDescending' | 'sortUnSort' = 'sortUnSort';
            if (sort === 'asc') {
                iconName = 'sortAscending';
            } else if (sort === 'desc') {
                iconName = 'sortDescending';
            }
            this.appendIcon(eSort, iconName);
            eSort.classList.toggle('ag-transpose-field-button-active', !!sort);
        }
        if (filterable) {
            const active = fieldCol.isFilterActive();
            this.appendIcon(eFilter, active ? 'filterActive' : 'filter');
            eFilter.classList.toggle('ag-transpose-field-button-active', active);
        }
    }

    private onSortClicked(event: MouseEvent): void {
        const fieldCol = this.fieldCol;
        if (fieldCol) {
            this.beans.sortSvc?.progressSortFromEvent(fieldCol, event);
        }
    }

    private onFilterClicked(): void {
        const fieldCol = this.fieldCol;
        if (fieldCol) {
            this.beans.menuSvc?.showFilterMenu({
                column: fieldCol,
                containerType: 'columnFilter',
                positionBy: 'button',
                buttonElement: this.eFilter,
            });
        }
    }

    private appendIcon(
        parent: HTMLElement,
        iconName: 'sortAscending' | 'sortDescending' | 'sortUnSort' | 'filter' | 'filterActive'
    ): void {
        const icon = _createIconNoSpan(iconName, this.beans);
        if (icon) {
            parent.appendChild(icon);
        }
    }

    private toggle(): void {
        const rowNode = this.params?.node as RowNode | undefined;
        if (rowNode) {
            this.transposeSvc.toggleFieldGroup(rowNode);
        }
    }
}
