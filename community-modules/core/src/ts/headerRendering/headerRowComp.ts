import { Component } from '../widgets/component';
import { Autowired, PostConstruct, PreDestroy } from '../context/context';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ColumnGroupChild } from '../entities/columnGroupChild';
import { ColumnGroup } from '../entities/columnGroup';
import { ColumnController } from '../columnController/columnController';
import { Column } from '../entities/column';
import { DropTarget } from '../dragAndDrop/dragAndDropService';
import { Events } from '../events';
import { HeaderWrapperComp } from './header/headerWrapperComp';
import { HeaderGroupWrapperComp } from './headerGroup/headerGroupWrapperComp';
import { Constants } from '../constants';
import { FloatingFilterWrapper } from '../filter/floating/floatingFilterWrapper';
import { isBrowserSafari } from '../utils/browser';
import { missing } from '../utils/generic';
import { removeFromArray } from '../utils/array';
import { setDomChildOrder } from '../utils/dom';
import { FocusController } from '../focusController';
import { AbstractHeaderWrapper } from './header/abstractHeaderWrapper';

export enum HeaderRowType {
    COLUMN_GROUP, COLUMN, FLOATING_FILTER
}

export class HeaderRowComp extends Component {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('focusController') private focusController: FocusController;

    private readonly dept: number;
    private readonly pinned: string;

    private readonly dropTarget: DropTarget;
    private readonly type: HeaderRowType;
    private rowIndex: number;

    private headerComps: { [key: string]: AbstractHeaderWrapper; } = {};

    constructor(dept: number, type: HeaderRowType, pinned: string, dropTarget: DropTarget) {
        super(/* html */`<div class="ag-header-row" role="row"></div>`);
        this.dept = dept;
        this.type = type;
        this.pinned = pinned;
        this.dropTarget = dropTarget;

        const niceClassName = HeaderRowType[type].toLowerCase().replace(/_/g, '-');
        this.addCssClass(`ag-header-row-${niceClassName}`);

        if (isBrowserSafari()) {
            // fix for a Safari rendering bug that caused the header to flicker above chart panels
            // as you move the mouse over the header
            this.getGui().style.transform = 'translateZ(0)';
        }
    }

    public forEachHeaderElement(callback: (comp: Component) => void): void {
        Object.keys(this.headerComps).forEach(key => {
            callback(this.headerComps[key]);
        });
    }

    public setRowIndex(idx: number) {
        this.rowIndex = idx;
        this.getGui().setAttribute('aria-rowindex', (idx + 1).toString());
    }

    public getRowIndex(): number {
        return this.rowIndex;
    }

    public getType(): HeaderRowType {
        return this.type;
    }

    @PreDestroy
    private destroyAllChildComponents(): void {
        const idsOfAllChildren = Object.keys(this.headerComps);
        this.destroyChildComponents(idsOfAllChildren);
    }

    private destroyChildComponents(idsToDestroy: string[], keepFocused?: boolean): void {
        idsToDestroy.forEach(id => {
            const childHeaderWrapper: AbstractHeaderWrapper = this.headerComps[id];

            if (
                keepFocused &&
                !childHeaderWrapper.getColumn().isMoving() &&
                this.focusController.isHeaderWrapperFocused(childHeaderWrapper)
            ) {
                return;
            }

            this.getGui().removeChild(childHeaderWrapper.getGui());
            this.destroyBean(childHeaderWrapper);
            delete this.headerComps[id];
        });
    }

    private onRowHeightChanged(): void {
        let headerRowCount = this.columnController.getHeaderRowCount();
        const sizes: number[] = [];

        let numberOfFloating = 0;
        let groupHeight: number;
        let headerHeight: number;

        if (this.columnController.isPivotMode()) {
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        } else {
            if (this.columnController.hasFloatingFilters()) {
                headerRowCount++;
                numberOfFloating = 1;
            }

            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        }

        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;

        for (let i = 0; i < numberOfGroups; i++) { sizes.push(groupHeight); }

        sizes.push(headerHeight);

        for (let i = 0; i < numberOfFloating; i++) { sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight()); }

        let rowHeight = 0;

        for (let i = 0; i < this.dept; i++) { rowHeight += sizes[i]; }

        this.getGui().style.top = rowHeight + 'px';
        this.getGui().style.height = sizes[this.dept] + 'px';
    }

    //noinspection JSUnusedLocalSymbols
    @PostConstruct
    private init(): void {
        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();

        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));

        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));

        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    }

    private onColumnResized(): void {
        this.setWidth();
    }

    private setWidth(): void {
        const width = this.getWidthForRow();
        this.getGui().style.width = width + 'px';
    }

    private getWidthForRow(): number {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        if (printLayout) {
            const centerRow = missing(this.pinned);

            if (centerRow) {
                return this.columnController.getContainerWidth(Constants.PINNED_RIGHT)
                    + this.columnController.getContainerWidth(Constants.PINNED_LEFT)
                    + this.columnController.getContainerWidth(null);
            }

            return 0;
        }

        // if not printing, just return the width as normal
        return this.columnController.getContainerWidth(this.pinned);
    }

    private onGridColumnsChanged(): void {
        this.removeAndDestroyAllChildComponents();
    }

    private removeAndDestroyAllChildComponents(): void {
        const idsOfAllChildren = Object.keys(this.headerComps);
        this.destroyChildComponents(idsOfAllChildren);
    }

    private onDisplayedColumnsChanged(): void {
        this.onVirtualColumnsChanged();
        this.setWidth();
    }

    private getItemsAtDepth(): ColumnGroupChild[] {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        if (printLayout) {
            // for print layout, we add all columns into the center
            const centerContainer = missing(this.pinned);
            if (centerContainer) {
                let result: ColumnGroupChild[] = [];
                [Constants.PINNED_LEFT, null, Constants.PINNED_RIGHT].forEach(pinned => {
                    const items = this.columnController.getVirtualHeaderGroupRow(
                        pinned,
                        this.type == HeaderRowType.FLOATING_FILTER ?
                            this.dept - 1 :
                            this.dept
                    );
                    result = result.concat(items);
                });
                return result;
            }
            return [];
        }

        // when in normal layout, we add the columns for that container only
        return this.columnController.getVirtualHeaderGroupRow(
            this.pinned,
            this.type == HeaderRowType.FLOATING_FILTER ?
                this.dept - 1 :
                this.dept
        );
    }

    private onVirtualColumnsChanged(): void {
        const currentChildIds = Object.keys(this.headerComps);
        const correctChildIds: string[] = [];
        const itemsAtDepth = this.getItemsAtDepth();

        itemsAtDepth.forEach((child: ColumnGroupChild) => {
            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state.
            // (a broken group is one that is split, ie columns in the group have a non-group column
            // in between them)
            if (child.isEmptyGroup()) {
                return;
            }

            const idOfChild = child.getUniqueId();
            const eParentContainer = this.getGui();

            // if we already have this cell rendered, do nothing
            const colAlreadyInDom = currentChildIds.indexOf(idOfChild) >= 0;
            let headerComp: AbstractHeaderWrapper;
            let eHeaderCompGui: HTMLElement;
            if (colAlreadyInDom) {
                removeFromArray(currentChildIds, idOfChild);
            } else {
                headerComp = this.createHeaderComp(child);
                this.headerComps[idOfChild] = headerComp;
                eHeaderCompGui = headerComp.getGui();
                eParentContainer.appendChild(eHeaderCompGui);
            }

            correctChildIds.push(idOfChild);
        });

        // at this point, anything left in currentChildIds is an element that is no longer in the viewport
        this.destroyChildComponents(currentChildIds, true);

        const ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        if (ensureDomOrder) {
            const correctChildOrder = correctChildIds.map(id => this.headerComps[id].getGui());
            setDomChildOrder(this.getGui(), correctChildOrder);
        }
    }

    private createHeaderComp(columnGroupChild: ColumnGroupChild): AbstractHeaderWrapper {
        let result: AbstractHeaderWrapper;

        switch (this.type) {
            case HeaderRowType.COLUMN:
                result = new HeaderWrapperComp(columnGroupChild as Column, this.dropTarget, this.pinned);
                break;
            case HeaderRowType.COLUMN_GROUP:
                result = new HeaderGroupWrapperComp(columnGroupChild as ColumnGroup, this.dropTarget, this.pinned);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new FloatingFilterWrapper(columnGroupChild as Column, this.pinned);
                break;
        }

        this.createBean(result);
        result.setParentComponent(this);

        return result;
    }

    public getHeaderComps(): { [key: string]: AbstractHeaderWrapper; } {
        return this.headerComps;
    }
}
