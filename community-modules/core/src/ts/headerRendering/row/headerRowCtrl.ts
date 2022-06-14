import { ColumnModel } from "../../columns/columnModel";
import { Constants } from "../../constants/constants";
import { BeanStub } from "../../context/beanStub";
import { Autowired, PreDestroy } from "../../context/context";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { IHeaderColumn } from "../../entities/iHeaderColumn";
import { Events } from "../../eventKeys";
import { FocusService } from "../../focusService";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { isBrowserSafari } from "../../utils/browser";
import { getAllValuesInObject, iterateObject } from "../../utils/object";
import { AbstractHeaderCellCtrl } from "../cells/abstractCell/abstractHeaderCellCtrl";
import { HeaderFilterCellCtrl } from "../cells/floatingFilter/headerFilterCellCtrl";
import { HeaderCellCtrl } from "../cells/column/headerCellCtrl";
import { HeaderGroupCellCtrl } from "../cells/columnGroup/headerGroupCellCtrl";
import { HeaderRowType } from "./headerRowComp";
import { values } from "../../utils/generic";

export interface IHeaderRowComp {
    setTransform(transform: string): void;
    setTop(top: string): void;
    setHeight(height: string): void;
    setHeaderCtrls(ctrls: AbstractHeaderCellCtrl[]): void;
    setWidth(width: string): void;
    setAriaRowIndex(rowIndex: number): void;
}

let instanceIdSequence = 0;

export class HeaderRowCtrl extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('focusService') private focusService: FocusService;

    private comp: IHeaderRowComp;
    private rowIndex: number;
    private pinned: string | null;
    private type: HeaderRowType;

    private instanceId = instanceIdSequence++;

    private headerCellCtrls: { [key: string]: AbstractHeaderCellCtrl } = {};

    constructor(rowIndex: number, pinned: string | null, type: HeaderRowType) {
        super();
        this.rowIndex = rowIndex;
        this.pinned = pinned;
        this.type = type;
    }

    public getInstanceId(): number {
        return this.instanceId;
    }

    public setComp(comp: IHeaderRowComp): void {
        this.comp = comp;

        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();

        this.addEventListeners();

        if (isBrowserSafari()) {
            // fix for a Safari rendering bug that caused the header to flicker above chart panels
            // as you move the mouse over the header
            this.comp.setTransform('translateZ(0)');
        }

        comp.setAriaRowIndex(this.rowIndex + 1);
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));

        // when print layout changes, it changes what columns are in what section
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDisplayedColumnsChanged.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this));
    }

    public getHeaderCellCtrl(column: ColumnGroup): HeaderGroupCellCtrl | undefined;
    public getHeaderCellCtrl(column: Column): HeaderCellCtrl | undefined;
    public getHeaderCellCtrl(column: any): any {
        return values(this.headerCellCtrls).find(cellCtrl => cellCtrl.getColumnGroupChild() === column);
    }

    private onDisplayedColumnsChanged(): void {
        this.onVirtualColumnsChanged();
        this.setWidth();
        this.onRowHeightChanged();
    }

    public getType(): HeaderRowType {
        return this.type;
    }

    private onColumnResized(): void {
        this.setWidth();
    }

    private setWidth(): void {
        const width = this.getWidthForRow();
        this.comp.setWidth(`${width}px`);
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

        if (this.columnModel.hasFloatingFilters()) {
            headerRowCount++;
            numberOfFloating = 1;
        }

        const groupHeight = this.columnModel.getColumnGroupHeaderRowHeight();
        const headerHeight = this.columnModel.getColumnHeaderRowHeight();

        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;

        for (let i = 0; i < numberOfGroups; i++) { sizes.push(groupHeight as number); }

        sizes.push(headerHeight);

        for (let i = 0; i < numberOfFloating; i++) { sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight() as number); }

        let topOffset = 0;

        for (let i = 0; i < this.rowIndex; i++) { topOffset += sizes[i]; }

        const thisRowHeight = sizes[this.rowIndex] + 'px';

        this.comp.setTop(topOffset + 'px');
        this.comp.setHeight(thisRowHeight);
    }

    public getPinned(): string | null {
        return this.pinned;
    }

    public getRowIndex(): number {
        return this.rowIndex;
    }

    private onVirtualColumnsChanged(): void {
        const oldCtrls = this.headerCellCtrls;
        this.headerCellCtrls = {};
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
            let headerCtrl: AbstractHeaderCellCtrl | undefined = oldCtrls[idOfChild];
            delete oldCtrls[idOfChild];

            // it's possible there is a new Column with the same ID, but it's for a different Column.
            // this is common with pivoting, where the pivot cols change, but the id's are still pivot_0,
            // pivot_1 etc. so if new col but same ID, need to remove the old col here first as we are
            // about to replace it in the this.headerComps map.
            const forOldColumn = headerCtrl && headerCtrl.getColumnGroupChild() != child;
            if (forOldColumn) {
                this.destroyBean(headerCtrl);
                headerCtrl = undefined;
            }

            if (headerCtrl == null) {
                switch (this.type) {
                    case HeaderRowType.FLOATING_FILTER:
                        headerCtrl = this.createBean(new HeaderFilterCellCtrl(child as Column, this));
                        break;
                    case HeaderRowType.COLUMN_GROUP:
                        headerCtrl = this.createBean(new HeaderGroupCellCtrl(child as ColumnGroup, this));
                        break;
                    default:
                        headerCtrl = this.createBean(new HeaderCellCtrl(child as Column, this));
                        break;
                }
            }

            this.headerCellCtrls[idOfChild] = headerCtrl;
        });

        // we want to keep columns that are focused, otherwise keyboard navigation breaks
        const isFocusedAndDisplayed = (ctrl: HeaderCellCtrl) => {
            const isFocused = this.focusService.isHeaderWrapperFocused(ctrl);
            if (!isFocused) { return false; }
            const isDisplayed = this.columnModel.isDisplayed(ctrl.getColumnGroupChild());
            return isDisplayed;
        };

        iterateObject(oldCtrls, (id: string, oldCtrl: HeaderCellCtrl) => {
            const keepCtrl = isFocusedAndDisplayed(oldCtrl);
            if (keepCtrl) {
                this.headerCellCtrls[id] = oldCtrl;
            } else {
                this.destroyBean(oldCtrl);
            }
        });

        const ctrlsToDisplay = getAllValuesInObject(this.headerCellCtrls);
        this.comp.setHeaderCtrls(ctrlsToDisplay);
    }

    @PreDestroy
    private destroyCtrls(): void {
        iterateObject(this.headerCellCtrls, (key, ctrl)=> {
            this.destroyBean(ctrl);
        });
        this.headerCellCtrls = {};
    }

    private getColumnsInViewport(): IHeaderColumn[] {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        return printLayout ? this.getColumnsInViewportPrintLayout() : this.getColumnsInViewportNormalLayout();
    }

    private getColumnsInViewportPrintLayout(): IHeaderColumn[] {
        // for print layout, we add all columns into the center
        if (this.pinned != null) { return []; }

        let viewportColumns: IHeaderColumn[] = [];
        const actualDepth = this.getActualDepth();

        [Constants.PINNED_LEFT, null, Constants.PINNED_RIGHT].forEach(pinned => {
            const items = this.columnModel.getVirtualHeaderGroupRow(pinned, actualDepth);
            viewportColumns = viewportColumns.concat(items);
        });

        return viewportColumns;
    }

    private getActualDepth(): number {
        return this.type == HeaderRowType.FLOATING_FILTER ? this.rowIndex - 1 : this.rowIndex;
    }

    private getColumnsInViewportNormalLayout(): IHeaderColumn[] {
        // when in normal layout, we add the columns for that container only
        return this.columnModel.getVirtualHeaderGroupRow(this.pinned, this.getActualDepth());
    }

    public focusHeader(column: IHeaderColumn, event?: KeyboardEvent): boolean {
        const allCtrls = getAllValuesInObject(this.headerCellCtrls);
        const ctrl: AbstractHeaderCellCtrl = allCtrls.find(ctrl => ctrl.getColumnGroupChild() == column);
        if (!ctrl) { return false; }

        ctrl.focus(event);

        return true;
    }
}