import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ColumnController } from '../columnController/columnController';
import { GridPanel } from '../gridPanel/gridPanel';
import { Autowired, Optional } from '../context/context';
import { HeaderContainer } from './headerContainer';
import { Events } from '../events';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { GridApi } from '../gridApi';
import { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import { Constants } from '../constants';
import { addOrRemoveCssClass, setDisplayed } from '../utils/dom';
import { ManagedFocusComponent } from '../widgets/managedFocusComponent';
import { FocusController } from '../focusController';
import { ColumnGroup } from '../entities/columnGroup';
import { HeaderPositionUtils, HeaderPosition } from './header/headerPosition';
import { Column } from '../entities/column';
import { AnimationFrameService } from '../misc/animationFrameService';
import { HeaderRowType } from './headerRowComp';
import { ColumnGroupChild } from '../entities/columnGroupChild';
import { RowPositionUtils } from '../entities/rowPosition';
import { IRangeController } from '../interfaces/iRangeController';
import { _ } from '../utils';

enum GridContainers {
    CenterContainer,
    LeftContainer,
    RightContainer
}

enum NavigationDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export class HeaderRootComp extends ManagedFocusComponent {
    private static TEMPLATE = /* html */
        `<div class="ag-header" role="presentation">
            <div class="ag-pinned-left-header" ref="ePinnedLeftHeader" role="presentation"></div>
            <div class="ag-header-viewport" ref="eHeaderViewport" role="presentation">
                <div class="ag-header-container" ref="eHeaderContainer" role="rowgroup"></div>
            </div>
            <div class="ag-pinned-right-header" ref="ePinnedRightHeader" role="presentation"></div>
        </div>`;

    @RefSelector('ePinnedLeftHeader') private ePinnedLeftHeader: HTMLElement;
    @RefSelector('ePinnedRightHeader') private ePinnedRightHeader: HTMLElement;
    @RefSelector('eHeaderContainer') private eHeaderContainer: HTMLElement;
    @RefSelector('eHeaderViewport') private eHeaderViewport: HTMLElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired("animationFrameService") private animationFrameService: AnimationFrameService;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;
    @Autowired('focusController') private focusController: FocusController;
    @Autowired('rowPositionUtils') private rowPositionUtils: RowPositionUtils;
    @Autowired('headerPositionUtils') private headerPositionUtils: HeaderPositionUtils;
    @Optional('rangeController') private rangeController: IRangeController;

    private childContainers: HeaderContainer[] = [];
    private gridPanel: GridPanel;
    private printLayout: boolean;

    constructor() {
        super(HeaderRootComp.TEMPLATE);
    }

    protected postConstruct(): void {
        super.postConstruct();

        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        this.gridApi.registerHeaderRootComp(this);
        this.autoWidthCalculator.registerHeaderRootComp(this);

        const centerContainer = new HeaderContainer(this.eHeaderContainer, this.eHeaderViewport, null);
        const pinnedLeftContainer = new HeaderContainer(this.ePinnedLeftHeader, null, Constants.PINNED_LEFT);
        const pinnedRightContainer = new HeaderContainer(this.ePinnedRightHeader, null, Constants.PINNED_RIGHT);

        this.childContainers[GridContainers.LeftContainer] = pinnedLeftContainer;
        this.childContainers[GridContainers.CenterContainer] = centerContainer;
        this.childContainers[GridContainers.RightContainer] = pinnedRightContainer;

        this.childContainers.forEach(container => this.createManagedBean(container));

        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshHeader.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));

        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));

        this.onPivotModeChanged();
        this.addPreventHeaderScroll();

        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
        this.childContainers.forEach(c => c.registerGridComp(gridPanel));
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        // defaultPrevented will be true when inner elements of the header are already managing the tab behavior.
        if (e.defaultPrevented) { return; }

        this.navigateHorizontally(e.shiftKey ? NavigationDirection.LEFT : NavigationDirection.RIGHT);

        e.preventDefault();
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        if (e.defaultPrevented) { return; }

        let direction: NavigationDirection;

        switch (e.keyCode) {
            case Constants.KEY_LEFT:
                direction = NavigationDirection.LEFT;
            case Constants.KEY_RIGHT:
                if (!_.exists(direction)) {
                    direction = NavigationDirection.RIGHT;
                }
                this.navigateHorizontally(direction);
                break;
            case Constants.KEY_UP:
                direction = NavigationDirection.UP;
            case Constants.KEY_DOWN:
                if (!_.exists(direction)) {
                    direction = NavigationDirection.DOWN;
                }
                if (!this.navigateVertically(direction)) { return; }
                e.preventDefault();
                break;
            default:
                return;
        }
    }

    protected onFocusOut(e: FocusEvent): void {
        const { relatedTarget }  = e;
        const eGui = this.getGui();

        if (!relatedTarget && eGui.contains(document.activeElement)) { return; }

        if (!eGui.contains(relatedTarget as HTMLElement)) {
            this.focusController.clearFocusedHeader();
        }
    }

    private navigateVertically(direction: NavigationDirection): boolean {
        const focusedHeader = this.focusController.getFocusedHeader();

        if (!focusedHeader) { return false; }

        const { headerRowIndex, pinned, column } = focusedHeader;
        const currentContainer = this.getChildContainer(pinned);
        const rowComps = currentContainer.getRowComps();
        const rowLen = rowComps.length;
        const isUp = direction === NavigationDirection.UP ;
        const nextRow = isUp ?  headerRowIndex - 1 : headerRowIndex + 1;

        if (nextRow < 0) { return false; }

        if (nextRow >= rowLen) {
            // focusGridView returns false when the grid has no cells rendered.
            return this.focusGridView();
        }

        const currentRowType = rowComps[headerRowIndex].getType();
        const nextRowComp = rowComps[nextRow];

        let nextScrollColumn: ColumnGroup | Column;
        let nextFocusColumn: ColumnGroupChild | Column;

        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            const currentColumn = column as ColumnGroup;
            nextScrollColumn = isUp ? currentColumn.getParent() : currentColumn.getDisplayedLeafColumns()[0];
            nextFocusColumn = isUp ? nextScrollColumn : currentColumn.getDisplayedChildren()[0];
        } else if (currentRowType === HeaderRowType.FLOATING_FILTER) {
            nextScrollColumn = nextFocusColumn = column;
        } else {
            const currentColumn = column as Column;
            nextScrollColumn = nextFocusColumn = isUp ? currentColumn.getParent() : currentColumn;
        }

        if (!nextScrollColumn || !nextFocusColumn) { return; }

        this.scrollToColumn(nextScrollColumn);

        const nextHeader = nextRowComp.getHeaderComps()[nextFocusColumn.getUniqueId() as string];

        if (nextHeader) {
            nextHeader.getFocusableElement().focus();
            return true;
        }

        return false;
    }

    private navigateHorizontally(direction: NavigationDirection): void {
        const focusedHeader = this.focusController.getFocusedHeader();
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        let nextHeader: HeaderPosition;
        let normalisedDirection: 'Before' |  'After';

        if (direction === NavigationDirection.LEFT !== isRtl) {
            normalisedDirection = 'Before';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection);
        } else {
            normalisedDirection = 'After';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection);
        }

        if (nextHeader) {
            this.scrollToColumn(nextHeader.column, normalisedDirection);

            const childContainer = this.getChildContainer(nextHeader.pinned);
            const rowComp = childContainer.getRowComps()[nextHeader.headerRowIndex];
            const headerComps = rowComp.getHeaderComps();

            const headerCompId = Object.keys(headerComps).find(key => {
                const nextHeaderColumn = nextHeader.column;
                let currentHeaderColumn = headerComps[key].getColumn();

                while (currentHeaderColumn) {
                    if (nextHeaderColumn === currentHeaderColumn) {
                        return true;
                    }
                    currentHeaderColumn = currentHeaderColumn.getParent();
                }
                return false;
            });

            if (headerCompId) {
                headerComps[headerCompId].getFocusableElement().focus();
            }
        }
    }

    private getChildContainer(pinned: string): HeaderContainer {
        const containerIdx = pinned === 'left'
            ? GridContainers.LeftContainer
            : (pinned === 'right'
                ? GridContainers.RightContainer
                : GridContainers.CenterContainer
            );

        return this.childContainers[containerIdx];
    }

    private focusGridView(): boolean {
        const { rowIndex, rowPinned } = this.rowPositionUtils.getFirstRow();
        const focusedHeader = this.focusController.getFocusedHeader();
        const column = focusedHeader.column as Column;

        if (!_.exists(rowIndex)) { return false; }

        if (!rowPinned) {
            this.gridPanel.ensureColumnVisible(column);
            this.gridPanel.ensureIndexVisible(rowIndex, 'top');

            // make sure the cell is rendered, needed if we are to focus
            this.animationFrameService.flushAllFrames();
        }

        this.focusController.setFocusedCell(rowIndex, column, _.makeNull(rowPinned), true);

        if (this.rangeController) {
            const cellPosition = { rowIndex, rowPinned, column };
            this.rangeController.setRangeToCell(cellPosition);
        }

        return true;
    }

    private scrollToColumn(column: Column | ColumnGroup, direction: 'Before' | 'After' = 'After'): void {
        if (column.getPinned()) { return; }
        let columnToScrollTo: Column;

        if (column instanceof ColumnGroup) {
            const columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? _.last(columns) : columns[0];
        } else {
            columnToScrollTo = column;
        }

        this.gridPanel.ensureColumnVisible(columnToScrollTo);

        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();

        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();
    }

    private onDomLayoutChanged(): void {
        const newValue = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        if (this.printLayout !== newValue) {
            this.printLayout = newValue;
            this.refreshHeader();
        }
    }

    public setHorizontalScroll(offset: number): void {
        this.eHeaderContainer.style.transform = `translateX(${offset}px)`;
    }

    public forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void {
        this.childContainers.forEach(childContainer => childContainer.forEachHeaderElement(callback));
    }

    public refreshHeader() {
        this.childContainers.forEach(container => container.refresh());
    }

    private onPivotModeChanged(): void {
        const pivotMode = this.columnController.isPivotMode();

        addOrRemoveCssClass(this.getGui(), 'ag-pivot-on', pivotMode);
        addOrRemoveCssClass(this.getGui(), 'ag-pivot-off', !pivotMode);
    }

    public setHeight(height: number): void {
        // one extra pixel is needed here to account for the
        // height of the border
        const px = `${height + 1}px`;
        this.getGui().style.height = px;
        this.getGui().style.minHeight = px;
    }

    // if the user is in floating filter and hits tab a few times, the header can
    // end up scrolling to show items off the screen, leaving the grid and header
    // and the grid columns no longer in sync.
    private addPreventHeaderScroll() {
        this.addManagedListener(this.eHeaderViewport, 'scroll', () => {
            // if the header scrolls, the header will be out of sync. so we reset the
            // header scroll, and then scroll the body, which will in turn set the offset
            // on the header, giving the impression that the header scrolled as expected.
            const scrollLeft = this.eHeaderViewport.scrollLeft;
            if (scrollLeft !== 0) {
                this.gridPanel.scrollHorizontally(scrollLeft);
                this.eHeaderViewport.scrollLeft = 0;
            }
        });
    }

    public setHeaderContainerWidth(width: number) {
        this.eHeaderContainer.style.width = `${width}px`;
    }

    public setLeftVisible(visible: boolean): void {
        setDisplayed(this.ePinnedLeftHeader, visible);
    }

    public setRightVisible(visible: boolean): void {
        setDisplayed(this.ePinnedRightHeader, visible);
    }

    public getHeaderRowCount(): number {
        return this.childContainers.length === 0 ? 0 : this.childContainers[0].getRowComps().length;
    }
}
