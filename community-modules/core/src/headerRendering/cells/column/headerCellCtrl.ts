import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { HorizontalDirection } from "../../../constants/direction";
import { KeyCode } from '../../../constants/keyCode';
import { SortDirection } from "../../../entities/colDef";
import { Column } from "../../../entities/column";
import { Events } from "../../../eventKeys";
import { ColumnHeaderMouseLeaveEvent, ColumnHeaderMouseOverEvent } from "../../../events";
import { WithoutGridCommon } from "../../../interfaces/iCommon";
import { Beans } from "../../../rendering/beans";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { ColumnSortState } from "../../../utils/aria";
import { getElementSize } from "../../../utils/dom";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { HeaderComp, IHeader, IHeaderParams } from "./headerComp";

export interface IHeaderCellComp extends IAbstractHeaderCellComp {
    setWidth(width: string): void;
    setAriaSort(sort?: ColumnSortState): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeader | undefined;
}

type HeaderAriaDescriptionKey = 'filter' | 'menu' | 'sort' | 'selectAll' | 'filterButton';

export class HeaderCellCtrl extends AbstractHeaderCellCtrl<IHeaderCellComp, Column, any> {

    private refreshFunctions: (() => void)[] = [];

    private sortable: boolean | null | undefined;
    private displayName: string | null;
    private draggable: boolean;
    private dragSourceElement: HTMLElement | undefined;

    private userCompDetails: UserCompDetails;

    private userHeaderClasses: Set<string> = new Set();
    private ariaDescriptionProperties = new Map<HeaderAriaDescriptionKey, string>();

    constructor(column: Column, beans: Beans, parentRowCtrl: HeaderRowCtrl) {
        super(column, beans, parentRowCtrl);
        this.column = column;
    }

    public setComp(comp: IHeaderCellComp, eGui: HTMLElement, eResize: HTMLElement, eHeaderCompWrapper: HTMLElement): void {
        this.comp = comp;

        this.setGui(eGui);
        this.updateState();
        this.setupWidth();
        this.refreshSpanHeaderHeight();
        this.addColumnHoverListener();
        this.setupClassesFromColDef();
        this.addActiveHeaderMouseListeners();
        this.setupUserComp();

        this.createManagedBean(new HoverFeature([this.column], eGui));
        this.createManagedBean(new SetLeftFeature(this.column, eGui, this.beans));

        this.addResizeAndMoveKeyboardListeners();

        this.addManagedPropertyListeners(['suppressMovableColumns', 'suppressMenuHide', 'suppressAggFuncInHeader'], this.refresh.bind(this));
        this.addManagedListener(this.column, Column.EVENT_COL_DEF_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_HEADER_HEIGHT_CHANGED, this.onHeaderHeightChanged.bind(this));
    }

    protected resizeHeader(delta: number, shiftKey: boolean): void {
    }

    protected moveHeader(hDirection: HorizontalDirection): void {

    }

    private setupUserComp(): void {
        const compDetails = this.lookupUserCompDetails();
        this.setCompDetails(compDetails);
    }

    private setCompDetails(compDetails: UserCompDetails): void {
        this.userCompDetails = compDetails;
        this.comp.setUserCompDetails(compDetails);
    }

    private lookupUserCompDetails(): UserCompDetails {
        const params = this.createParams();
        const colDef = this.column.getColDef();
        return this.userComponentFactory.getHeaderCompDetails(colDef, params)!;
    }

    private createParams(): IHeaderParams {

        const params: IHeaderParams = this.gos.addGridCommonParams({
            column: this.column,
            displayName: this.displayName!,
            enableSorting: this.column.isSortable(),
            enableMenu: false,
            enableFilterButton: false,
            enableFilterIcon: false,
            showColumnMenu: (buttonElement: HTMLElement) => {
              
            },
            showColumnMenuAfterMouseClick: (mouseEvent: MouseEvent | Touch) => {
               
            },
            showFilter: (buttonElement: HTMLElement) => {
                
            },
            progressSort: (multiSort?: boolean) => {
            },
            setSort: (sort: SortDirection, multiSort?: boolean) => {
            },
            eGridHeader: this.getGui(),
            setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
            }
        });

        return params;
    }

   
    public getSelectAllGui(): HTMLElement {
        return undefined!;
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        if (e.key === KeyCode.SPACE) {
        }
        if (e.key === KeyCode.ENTER) {
        }
        if (e.key === KeyCode.DOWN && e.altKey) {
        }
    }




    private setupClassesFromColDef(): void {
        const refreshHeaderClasses = () => {
            const colDef = this.column.getColDef();
            const classes = CssClassApplier.getHeaderClassesFromColDef(colDef, this.gos, this.column, null);

            const oldClasses = this.userHeaderClasses;
            this.userHeaderClasses = new Set(classes);

            classes.forEach(c => {
                if (oldClasses.has(c)) {
                    // class already added, no need to apply it, but remove from old set
                    oldClasses.delete(c);
                } else {
                    // class new since last time, so apply it
                    this.comp.addOrRemoveCssClass(c, true);
                }
            });

            // now old set only has classes that were applied last time, but not this time, so remove them
            oldClasses.forEach(c => this.comp.addOrRemoveCssClass(c, false));
        };

        this.refreshFunctions.push(refreshHeaderClasses);
        refreshHeaderClasses();
    }


    private updateState(): void {
        this.sortable = this.column.isSortable();
        this.displayName = this.calculateDisplayName();
        this.draggable = this.workOutDraggable();
    }

    public addRefreshFunction(func: () => void): void {
        this.refreshFunctions.push(func);
    }

    private refresh(): void {
        this.updateState();
        this.refreshHeaderComp();
        this.refreshFunctions.forEach(f => f());
    }

    private refreshHeaderComp(): void {
        const newCompDetails = this.lookupUserCompDetails();

        const compInstance = this.comp.getUserCompInstance();

        // only try refresh if old comp exists adn it is the correct type
        const attemptRefresh = compInstance != null && this.userCompDetails.componentClass == newCompDetails.componentClass;

        const headerCompRefreshed = attemptRefresh ? this.attemptHeaderCompRefresh(newCompDetails.params) : false;

        if (headerCompRefreshed) {
            // we do this as a refresh happens after colDefs change, and it's possible the column has had it's
            // draggable property toggled. no need to call this if not refreshing, as setDragSource is done
            // as part of appendHeaderComp
        } else {
            this.setCompDetails(newCompDetails);
        }
    }

    public attemptHeaderCompRefresh(params: IHeaderParams): boolean {
        const headerComp = this.comp.getUserCompInstance();
        if (!headerComp) { return false; }

        // if no refresh method, then we want to replace the headerComp
        if (!headerComp.refresh) { return false; }

        const res = headerComp.refresh(params);

        return res;
    }

    private calculateDisplayName(): string | null {
        return this.beans.columnModel.getDisplayNameForColumn(this.column, 'header', true);
    }

    private checkDisplayName(): void {
        // display name can change if aggFunc different, eg sum(Gold) is now max(Gold)
        if (this.displayName !== this.calculateDisplayName()) {
            this.refresh();
        }
    }

    private workOutDraggable(): boolean {
        const colDef = this.column.getColDef();
        const isSuppressMovableColumns = this.gos.get('suppressMovableColumns');

        const colCanMove = !isSuppressMovableColumns && !colDef.suppressMovable && !colDef.lockPosition;

        // we should still be allowed drag the column, even if it can't be moved, if the column
        // can be dragged to a rowGroup or pivot drop zone
        return !!colCanMove || !!colDef.enableRowGroup || !!colDef.enablePivot;
    }

    private onColumnRowGroupChanged(): void {
        this.checkDisplayName();
    }

    private onColumnPivotChanged(): void {
        this.checkDisplayName();
    }

    private onColumnValueChanged(): void {
        this.checkDisplayName();
    }

    private setupWidth(): void {
        const listener = () => {
            const columnWidth = this.column.getActualWidth();
            this.comp.setWidth(`${columnWidth}px`);
        };

        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    }

    protected onDisplayedColumnsChanged(): void {
        super.onDisplayedColumnsChanged();
        if (!this.isAlive()) { return; }
        this.onHeaderHeightChanged();
    }

    private onHeaderHeightChanged() {
        this.refreshSpanHeaderHeight();
    }

    private refreshSpanHeaderHeight() {
        const { eGui, column, comp, beans } = this;
        if (!column.isSpanHeaderHeight()) {
            eGui.style.removeProperty('top');
            eGui.style.removeProperty('height');
            comp.addOrRemoveCssClass('ag-header-span-height', false);
            comp.addOrRemoveCssClass('ag-header-span-total', false);
            return;
        }

        const { numberOfParents, isSpanningTotal } = this.column.getColumnGroupPaddingInfo();

        comp.addOrRemoveCssClass('ag-header-span-height', numberOfParents > 0);

        const { columnModel } = beans;

        const headerHeight = columnModel.getColumnHeaderRowHeight();
        if (numberOfParents === 0) {
            // if spanning has stopped then need to reset these values.
            comp.addOrRemoveCssClass('ag-header-span-total', false);
            eGui.style.setProperty('top', `0px`);
            eGui.style.setProperty('height', `${headerHeight}px`);
            return;
        }

        comp.addOrRemoveCssClass('ag-header-span-total', isSpanningTotal);

        const pivotMode = columnModel.isPivotMode();
        const groupHeaderHeight = pivotMode
            ? columnModel.getPivotGroupHeaderHeight()
            : columnModel.getGroupHeaderHeight();

        const extraHeight = numberOfParents * groupHeaderHeight;

        eGui.style.setProperty('top', `${-extraHeight}px`);
        eGui.style.setProperty('height', `${headerHeight + extraHeight}px`);
    }

    public setAriaDescriptionProperty(property: HeaderAriaDescriptionKey, value: string | null): void {
        if (value != null) {
            this.ariaDescriptionProperties.set(property, value);
        } else {
            this.ariaDescriptionProperties.delete(property);
        }
    }

    public announceAriaDescription(): void {
        if (!this.eGui.contains(this.beans.gos.getActiveDomElement())) { return; }
        const ariaDescription = 
            Array.from(this.ariaDescriptionProperties.keys())
                // always announce the filter description first
                .sort((a: string, b: string) => a === 'filter' ? - 1 : (b.charCodeAt(0) - a.charCodeAt(0)))
                .map((key: HeaderAriaDescriptionKey) => this.ariaDescriptionProperties.get(key))
                .join('. ');

        this.beans.ariaAnnouncementService.announceValue(ariaDescription);
    }

    private addColumnHoverListener(): void {
        const listener = () => {
            if (!this.gos.get('columnHoverHighlight')) { return; }
            const isHovered = this.beans.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', isHovered);
        };

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    }

    public getColId(): string {
        return this.column.getColId();
    }

    private addActiveHeaderMouseListeners(): void {
        const listener = (e: MouseEvent) => this.handleMouseOverChange(e.type === 'mouseenter');
        const clickListener = () => this.dispatchColumnMouseEvent(Events.EVENT_COLUMN_HEADER_CLICKED, this.column);
        const contextMenuListener = (event: MouseEvent) => this.handleContextMenuMouseEvent(event, undefined, this.column);

        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
        this.addManagedListener(this.getGui(), 'click', clickListener);
        this.addManagedListener(this.getGui(), 'contextmenu', contextMenuListener);
    }

    private handleMouseOverChange(isMouseOver: boolean): void {
        this.setActiveHeader(isMouseOver);
        const eventType = isMouseOver ?
            Events.EVENT_COLUMN_HEADER_MOUSE_OVER :
            Events.EVENT_COLUMN_HEADER_MOUSE_LEAVE;

        const event: WithoutGridCommon<ColumnHeaderMouseOverEvent> | WithoutGridCommon<ColumnHeaderMouseLeaveEvent> = {
            type: eventType,
            column: this.column,
        };

        this.eventService.dispatchEvent(event);
    }

    private setActiveHeader(active: boolean): void {
        this.comp.addOrRemoveCssClass('ag-header-active', active);
    }

    public getAnchorElementForMenu(isFilter?: boolean): HTMLElement {
        const headerComp = this.comp.getUserCompInstance();
        if (headerComp instanceof HeaderComp) {
        }
        return this.getGui();
    }

    protected destroy(): void {
        super.destroy();

        (this.refreshFunctions as any) = null;
        (this.dragSourceElement as any) = null;
        (this.userCompDetails as any) = null;
        (this.userHeaderClasses as any) = null;
        (this.ariaDescriptionProperties as any) = null;
    }
}
