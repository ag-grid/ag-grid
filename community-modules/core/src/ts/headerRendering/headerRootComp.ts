import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ColumnController } from '../columnController/columnController';
import { GridPanel } from '../gridPanel/gridPanel';
import { Autowired, PostConstruct } from '../context/context';
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
import { RowPositionUtils } from '../entities/rowPosition';
import { ColumnGroup } from '../entities/columnGroup';
import { HeaderPositionUtils, HeaderPosition } from './header/headerPosition';
import { Column } from '../entities/column';
import { _ } from '../utils';

enum GridContainers {
    CenterContainer,
    LeftContainer,
    RightContainer
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
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;
    @Autowired('focusController') private focusController: FocusController;
    @Autowired('rowPositionUtils')  private rowPositionUtils: RowPositionUtils;
    @Autowired('headerPositionUtils') private headerPositionUtils: HeaderPositionUtils;

    private childContainers: HeaderContainer[] = [];
    private gridPanel: GridPanel;
    private printLayout: boolean;

    constructor() {
        super(HeaderRootComp.TEMPLATE);
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
        this.childContainers.forEach(c => c.registerGridComp(gridPanel));
    }

    @PostConstruct
    private postConstruct(): void {
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

    protected onTabKeyDown(e: KeyboardEvent): void {
        const focusedHeader = this.focusController.getFocusedHeader();
        if (!focusedHeader) { return; }

        const { headerRowIndex, column, pinned } = focusedHeader;
        const nextRow = e.shiftKey ?  headerRowIndex - 1 : headerRowIndex + 1;

        if (nextRow < 0) { return; }

        const currentContainer = this.getChildContainer(pinned);
        const rowComps = currentContainer.getRowComps();

        if (nextRow >= rowComps.length) {
            if (!this.focusGridView()) { return; }
        } else {
            const currentColumn = column as ColumnGroup;
            const nextRowComp = rowComps[nextRow];
            const nextColumn = e.shiftKey ? currentColumn.getParent() : currentColumn.getDisplayedChildren()[0];

            if (!nextColumn) { return; }

            if (!e.shiftKey) {
                this.scrollToColumn(currentColumn.getDisplayedLeafColumns()[0]);
            } else {
                this.scrollToColumn(currentColumn);
            }

            const nextHeader = nextRowComp.getHeaderComps()[nextColumn.getUniqueId() as string];

            if (nextHeader) {
                nextHeader.getFocusableElement().focus();
            }
        }
        super.onTabKeyDown(e);
    }

    private getChildContainer(pinned: string): HeaderContainer {
        const containerIdx = GridContainers[pinned === 'left'
            ? 'LeftContainer'
            : (pinned === 'right'
                ? 'RightContainer'
                : 'CenterContainer')
        ];

        return this.childContainers[containerIdx];
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case Constants.KEY_LEFT:
            case Constants.KEY_RIGHT:
                this.navigateToNextHeader(e);
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

    private focusGridView(): boolean {
        const { focusController } = this;
        const cellToFocus = focusController.getFocusedCell();

        if (cellToFocus) {
            this.focusController.setFocusedCell(cellToFocus.rowIndex, cellToFocus.column, cellToFocus.rowPinned, true);
        } else {
            const firstRow = this.rowPositionUtils.getFirstRow();
            const firstColumn = this.columnController.getFirstDisplayedColumn();

            if (!firstRow || !firstColumn) { return false; }

            this.focusController.setFocusedCell(firstRow.rowIndex, firstColumn, firstRow.rowPinned, true);
        }

        return true;
    }

    private navigateToNextHeader(e: KeyboardEvent): void {
        const focusedHeader = this.focusController.getFocusedHeader();
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        let nextHeader: HeaderPosition;
        let direction: 'Before' |  'After';

        // faking a bitwise XOR using !==
        if (e.keyCode === Constants.KEY_LEFT !== isRtl) {
            direction = 'Before';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, direction);
        } else {
            direction = 'After';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, direction);
        }

        if (nextHeader) {
            this.scrollToColumn(nextHeader.column, direction);

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
