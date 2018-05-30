import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {GridPanel} from "../gridPanel/gridPanel";
import {Column} from "../entities/column";
import {Bean, Autowired, Context, PostConstruct, PreDestroy} from "../context/context";
import {HeaderContainer} from "./headerContainer";
import {EventService} from "../eventService";
import {Events} from "../events";
import {ScrollVisibleService} from "../gridPanel/scrollVisibleService";
import {Component} from "../widgets/component";
import {RefSelector} from "../widgets/componentAnnotations";
import {Utils as _} from "../utils";
import {GridApi} from "../gridApi";
import {AutoWidthCalculator} from "../rendering/autoWidthCalculator";

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
    @Autowired('context') private context: Context;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;

    private pinnedLeftContainer: HeaderContainer;
    private pinnedRightContainer: HeaderContainer;
    private centerContainer: HeaderContainer;

    private childContainers: HeaderContainer[];

    private gridPanel: GridPanel;

    constructor() {
        super(HeaderRootComp.TEMPLATE);
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
        this.centerContainer.registerGridComp(gridPanel);
        this.pinnedLeftContainer.registerGridComp(gridPanel);
        this.pinnedRightContainer.registerGridComp(gridPanel);
    }

    @PostConstruct
    private postConstruct(): void {

        this.gridApi.registerHeaderRootComp(this);
        this.autoWidthCalculator.registerHeaderRootComp(this);

        this.centerContainer = new HeaderContainer(this.eHeaderContainer, this.eHeaderViewport, null);
        this.childContainers = [this.centerContainer];

        this.pinnedLeftContainer = new HeaderContainer(this.ePinnedLeftHeader, null, Column.PINNED_LEFT);
        this.pinnedRightContainer = new HeaderContainer(this.ePinnedRightHeader, null, Column.PINNED_RIGHT);
        this.childContainers.push(this.pinnedLeftContainer);
        this.childContainers.push(this.pinnedRightContainer);

        this.childContainers.forEach( container => this.context.wireBean(container) );

        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshHeader.bind(this));

        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.eventService.addEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));

        this.addPreventHeaderScroll();

        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    }

    public setHorizontalScroll(offset: number): void {
        this.eHeaderContainer.style.left = offset + 'px';
    }

    public forEachHeaderElement(callback: (renderedHeaderElement: Component)=>void): void {
        this.childContainers.forEach( childContainer => childContainer.forEachHeaderElement(callback) );
    }

    @PreDestroy
    public destroy(): void {
        this.childContainers.forEach( container => container.destroy() );
    }

    public refreshHeader() {
        this.childContainers.forEach( container => container.refresh() );
    }

    private onPivotModeChanged(): void {
        let pivotMode = this.columnController.isPivotMode();
        _.addOrRemoveCssClass(this.getGui(),'ag-pivot-on', pivotMode);
        _.addOrRemoveCssClass(this.getGui(),'ag-pivot-off', !pivotMode);
    }

    public setHeight(height: number): void {
        this.getGui().style.height = height + 'px';
        this.getGui().style.minHeight = height + 'px';
    }

    // if the user is in floating filter and hits tab a few times, the header can
    // end up scrolling to show items off the screen, leaving the grid and header
    // and the grid columns no longer in sync.
    private addPreventHeaderScroll() {
        this.addDestroyableEventListener(this.eHeaderViewport, 'scroll', ()=> {
            // if the header scrolls, the header will be out of sync. so we reset the
            // header scroll, and then scroll the body, which will in turn set the offset
            // on the header, giving the impression that the header scrolled as expected.
            let scrollLeft = this.eHeaderViewport.scrollLeft;
            if (scrollLeft!==0) {
                this.gridPanel.scrollHorizontally(scrollLeft);
                this.eHeaderViewport.scrollLeft = 0;
            }
        });
    }

    public setLeftVisible(visible: boolean): void {
        _.setVisible(this.ePinnedLeftHeader, visible);
    }

    public setRightVisible(visible: boolean): void {
        _.setVisible(this.ePinnedRightHeader, visible);
    }
}
