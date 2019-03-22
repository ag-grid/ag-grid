import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";
import { GridPanel } from "../gridPanel/gridPanel";
import { Column } from "../entities/column";
import { Autowired, Context, PostConstruct, PreDestroy } from "../context/context";
import { HeaderContainer } from "./headerContainer";
import { EventService } from "../eventService";
import { Events } from "../events";
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { GridApi } from "../gridApi";
import { AutoWidthCalculator } from "../rendering/autoWidthCalculator";
import { Constants } from "../constants";
import { _ } from "../utils";

export class HeaderRootComp extends Component {

    private static TEMPLATE =
        `<div class="ag-header" role="row">
            <div class="ag-pinned-left-header" ref="ePinnedLeftHeader" role="presentation"></div>
            <div class="ag-header-viewport" ref="eHeaderViewport" role="presentation">
                <div class="ag-header-container" ref="eHeaderContainer" role="presentation"></div>
            </div>
            <div class="ag-pinned-right-header" ref="ePinnedRightHeader" role="presentation"></div>
        </div>`;

    @RefSelector('ePinnedLeftHeader') private ePinnedLeftHeader: HTMLElement;
    @RefSelector('ePinnedRightHeader') private ePinnedRightHeader: HTMLElement;
    @RefSelector('eHeaderContainer') private eHeaderContainer: HTMLElement;
    @RefSelector('eHeaderViewport') private eHeaderViewport: HTMLElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;

    // private pinnedLeftContainer: HeaderContainer;
    // private pinnedRightContainer: HeaderContainer;
    // private centerContainer: HeaderContainer;

    private childContainers: HeaderContainer[];

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
        const pinnedLeftContainer = new HeaderContainer(this.ePinnedLeftHeader, null, Column.PINNED_LEFT);
        const pinnedRightContainer = new HeaderContainer(this.ePinnedRightHeader, null, Column.PINNED_RIGHT);

        this.childContainers = [centerContainer, pinnedLeftContainer, pinnedRightContainer];

        this.childContainers.forEach(container => this.getContext().wireBean(container));

        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshHeader.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));

        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));

        this.onPivotModeChanged();
        this.addPreventHeaderScroll();

        if (this.columnController.isReady()) {
            this.refreshHeader();
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
        this.childContainers.forEach(childContainer => childContainer.forEachHeaderElement(callback));
    }

    public destroy(): void {
        super.destroy();
        this.childContainers.forEach(container => container.destroy());
    }

    public refreshHeader() {
        this.childContainers.forEach(container => container.refresh());
    }

    private onPivotModeChanged(): void {
        const pivotMode = this.columnController.isPivotMode();
        _.addOrRemoveCssClass(this.getGui(), 'ag-pivot-on', pivotMode);
        _.addOrRemoveCssClass(this.getGui(), 'ag-pivot-off', !pivotMode);
    }

    public setHeight(height: number): void {
        const px = `${height}px`;
        this.getGui().style.height = px;
        this.getGui().style.minHeight = px;
    }

    // if the user is in floating filter and hits tab a few times, the header can
    // end up scrolling to show items off the screen, leaving the grid and header
    // and the grid columns no longer in sync.
    private addPreventHeaderScroll() {
        this.addDestroyableEventListener(this.eHeaderViewport, 'scroll', () => {
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
        _.setVisible(this.ePinnedLeftHeader, visible);
    }

    public setRightVisible(visible: boolean): void {
        _.setVisible(this.ePinnedRightHeader, visible);
    }
}
