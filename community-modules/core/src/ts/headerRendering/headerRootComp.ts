import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ColumnController } from '../columnController/columnController';
import { GridPanel } from '../gridPanel/gridPanel';
import { Autowired } from '../context/context';
import { HeaderContainer } from './headerContainer';
import { Events } from '../events';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { GridApi } from '../gridApi';
import { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import { Constants } from '../constants';
import { addOrRemoveCssClass, setDisplayed } from '../utils/dom';
import { ManagedFocusComponent } from '../widgets/managedFocusComponent';
import { HeaderNavigationService, HeaderNavigationDirection } from './header/headerNavigationService';
import { exists } from '../utils/generic';
import { KeyCode } from '../keyCode';

export type HeaderContainerPosition = 'left' | 'right' | 'center';

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
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;

    private gridPanel: GridPanel;
    private printLayout: boolean;
    private headerContainers: Map<HeaderContainerPosition, HeaderContainer> = new Map();

    constructor() {
        super(HeaderRootComp.TEMPLATE);
    }

    protected postConstruct(): void {
        super.postConstruct();

        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        this.gridApi.registerHeaderRootComp(this);
        this.autoWidthCalculator.registerHeaderRootComp(this);

        this.registerHeaderContainer(
            new HeaderContainer(this.eHeaderContainer, this.eHeaderViewport, null),
            'center'
        );

        this.registerHeaderContainer(
            new HeaderContainer(this.ePinnedLeftHeader, null, Constants.PINNED_LEFT),
            'left'
        );

        this.registerHeaderContainer(
            new HeaderContainer(this.ePinnedRightHeader, null, Constants.PINNED_RIGHT),
            'right'
        );

        this.headerContainers.forEach(
            container => this.createManagedBean(container)
        );

        this.headerNavigationService.registerHeaderRoot(this);

        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
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
        this.headerContainers.forEach(c => c.setupDragAndDrop(gridPanel));
    }

    private registerHeaderContainer(headerContainer: HeaderContainer, type: HeaderContainerPosition): void {
        this.headerContainers.set(type, headerContainer);
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        const direction = e.shiftKey !== isRtl
            ? HeaderNavigationDirection.LEFT
            : HeaderNavigationDirection.RIGHT;

        if (this.headerNavigationService.navigateHorizontally(direction, true) ||
            this.focusController.focusNextGridCoreContainer(e.shiftKey)
        ) {
            e.preventDefault();
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        let direction: HeaderNavigationDirection;

        switch (e.keyCode) {
            case KeyCode.LEFT:
                direction = HeaderNavigationDirection.LEFT;
            case KeyCode.RIGHT:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.RIGHT;
                }
                this.headerNavigationService.navigateHorizontally(direction);
                break;
            case KeyCode.UP:
                direction = HeaderNavigationDirection.UP;
            case KeyCode.DOWN:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.DOWN;
                }
                if (this.headerNavigationService.navigateVertically(direction)) {
                    e.preventDefault();
                }
                break;
            default:
                return;
        }
    }

    protected onFocusOut(e: FocusEvent): void {
        const { relatedTarget } = e;
        const eGui = this.getGui();

        if (!relatedTarget && eGui.contains(document.activeElement)) { return; }

        if (!eGui.contains(relatedTarget as HTMLElement)) {
            this.focusController.clearFocusedHeader();
        }
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
        this.headerContainers.forEach(
            childContainer => childContainer.forEachHeaderElement(callback)
        );
    }

    public refreshHeader() {
        this.headerContainers.forEach(
            container => container.refresh()
        );
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

    public getHeaderContainers(): Map<HeaderContainerPosition, HeaderContainer> {
        return this.headerContainers;
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
}
