import { ColumnModel } from "../../columns/columnModel";
import { Constants } from "../../constants/constants";
import { BeanStub } from "../../context/beanStub";
import { Autowired } from "../../context/context";
import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { Events } from "../../eventKeys";
import { FocusService } from "../../focusService";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { removeFromArray } from "../../utils/array";
import { isBrowserSafari } from "../../utils/browser";
import { getAllValuesInObject, iterateObject } from "../../utils/object";
import { HeaderCtrl } from "../columnHeader/headerCtrl";
import { HeaderRowType } from "./headerRowComp";

export interface IHeaderRowComp {
    setTransform(transform: string): void;
    setTop(top: string): void;
    setHeight(height: string): void;
    setHeaderCtrls(ctrls: HeaderCtrl[]): void;
    setWidth(width: string): void;
}

export class HeaderRowCtrl extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('focusService') private focusService: FocusService;

    private comp: IHeaderRowComp;
    private depth: number;
    private pinned: string | null;
    private type: HeaderRowType;

    private headerCtrls: { [key: string]: HeaderCtrl } = {};

    public setComp(comp: IHeaderRowComp, depth: number, pinned: string | null, type: HeaderRowType): void {
        this.comp = comp;
        this.depth = depth;
        this.pinned = pinned;
        this.type = type;

        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();

        this.addEventListeners();

        if (isBrowserSafari()) {
            // fix for a Safari rendering bug that caused the header to flicker above chart panels
            // as you move the mouse over the header
            this.comp.setTransform('translateZ(0)');
        }
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));

        // when print layout changes, it changes what columns are in what section
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDisplayedColumnsChanged.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));

        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this));
    }

    private onDisplayedColumnsChanged(): void {
        this.onVirtualColumnsChanged();
        this.setWidth();
    }

    private onColumnResized(): void {
        this.setWidth();
    }

    private setWidth(): void {
        const width = this.getWidthForRow();
        this.comp.setWidth(width + 'px');
    }

    private getWidthForRow(): number {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        if (printLayout) {
            const pinned = this.pinned != null;
            if (pinned) { return 0; }

            return this.columnModel.getContainerWidth(Constants.PINNED_RIGHT)
                + this.columnModel.getContainerWidth(Constants.PINNED_LEFT)
                + this.columnModel.getContainerWidth(null);
        }

        // if not printing, just return the width as normal
        return this.columnModel.getContainerWidth(this.pinned);
    }

    private onRowHeightChanged(): void {
        let headerRowCount = this.columnModel.getHeaderRowCount();
        const sizes: number[] = [];

        let numberOfFloating = 0;
        let groupHeight: number | null | undefined;
        let headerHeight: number | null | undefined;

        if (this.columnModel.isPivotMode()) {
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        } else {
            if (this.columnModel.hasFloatingFilters()) {
                headerRowCount++;
                numberOfFloating = 1;
            }

            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        }

        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;

        for (let i = 0; i < numberOfGroups; i++) { sizes.push(groupHeight as number); }

        sizes.push(headerHeight as number);

        for (let i = 0; i < numberOfFloating; i++) { sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight() as number); }

        let rowHeight = 0;

        for (let i = 0; i < this.depth; i++) { rowHeight += sizes[i]; }

        this.comp.setTop(rowHeight + 'px');
        this.comp.setHeight(sizes[this.depth] + 'px');
    }

    public getPinned(): string | null {
        return this.pinned;
    }

    public getDepth(): number {
        return this.depth;
    }

    private onVirtualColumnsChanged(): void {
        const oldCtrls = this.headerCtrls;
        this.headerCtrls = {};
        const columns = this.getColumnsInViewport();

        columns.forEach(child => {
            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state.
            // (a broken group is one that is split, ie columns in the group have a non-group column
            // in between them)
            if (child.isEmptyGroup()) {
                return;
            }

            const idOfChild = child.getUniqueId();

            // if we already have this cell rendered, do nothing
            let headerCtrl: HeaderCtrl | undefined = oldCtrls[idOfChild];
            delete oldCtrls[idOfChild];

            // it's possible there is a new Column with the same ID, but it's for a different Column.
            // this is common with pivoting, where the pivot cols change, but the id's are still pivot_0,
            // pivot_1 etc. so if new col but same ID, need to remove the old col here first as we are
            // about to replace it in the this.headerComps map.
            const forOldColumn = headerCtrl && headerCtrl.getColumnGroupOrChild() != child;
            if (forOldColumn) {
                this.destroyBean(headerCtrl);
                headerCtrl = undefined;
            }

            if (headerCtrl==null) {
                headerCtrl = this.createBean(new HeaderCtrl(child, this));
            }

            this.headerCtrls[idOfChild] = headerCtrl;
        });

        // we want to keep columns that are focused, otherwise keyboard navigation breaks
        const isFocusedAndDisplayed = (ctrl: HeaderCtrl) => {
            const isFocused = this.focusService.isHeaderWrapperFocused(ctrl);
            if (!isFocused) { return false; }
            const isDisplayed = this.columnModel.isDisplayed(ctrl.getColumnGroupOrChild());
            return isDisplayed;
        };

        iterateObject(oldCtrls, (id: string, oldCtrl: HeaderCtrl) => {
            const keepCtrl = isFocusedAndDisplayed(oldCtrl);
            if (keepCtrl) {
                this.headerCtrls[id] = oldCtrl;
            } else {
                this.destroyBean(oldCtrl);
            }
        });

        const ctrlsToDisplay = getAllValuesInObject(this.headerCtrls);
        this.comp.setHeaderCtrls(ctrlsToDisplay);
    }

    private getColumnsInViewport(): ColumnGroupChild[] {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        return printLayout ? this.getColumnsInViewportPrintLayout() : this.getColumnsInViewportNormalLayout();
    }

    private getColumnsInViewportPrintLayout(): ColumnGroupChild[] {
        // for print layout, we add all columns into the center
        if (this.pinned != null) { return []; }

        let viewportColumns: ColumnGroupChild[] = [];
        const actualDepth = this.getActualDepth();

        [Constants.PINNED_LEFT, null, Constants.PINNED_RIGHT].forEach(pinned => {
            const items = this.columnModel.getVirtualHeaderGroupRow(pinned, actualDepth);
            viewportColumns = viewportColumns.concat(items);
        });

        return viewportColumns;
    }

    private getActualDepth(): number {
        return this.type == HeaderRowType.FLOATING_FILTER ? this.depth - 1 : this.depth;
    }

    private getColumnsInViewportNormalLayout(): ColumnGroupChild[] {
        // when in normal layout, we add the columns for that container only
        return this.columnModel.getVirtualHeaderGroupRow(this.pinned, this.getActualDepth());
    }
}