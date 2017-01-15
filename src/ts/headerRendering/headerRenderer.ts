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

@Bean('headerRenderer')
export class HeaderRenderer {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('context') private context: Context;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

    private pinnedLeftContainer: HeaderContainer;
    private pinnedRightContainer: HeaderContainer;
    private centerContainer: HeaderContainer;

    private childContainers: HeaderContainer[];

    private eHeaderViewport: HTMLElement;
    private eRoot: HTMLElement;
    private eHeaderOverlay: HTMLElement;

    @PostConstruct
    private init() {
        this.eHeaderViewport = this.gridPanel.getHeaderViewport();
        this.eRoot = this.gridPanel.getRoot();
        this.eHeaderOverlay = this.gridPanel.getHeaderOverlay();

        this.centerContainer = new HeaderContainer(this.gridPanel.getHeaderContainer(), this.gridPanel.getHeaderViewport(), this.eRoot, null);
        this.childContainers = [this.centerContainer];

        if (!this.gridOptionsWrapper.isForPrint()) {
            this.pinnedLeftContainer = new HeaderContainer(this.gridPanel.getPinnedLeftHeader(), null, this.eRoot, Column.PINNED_LEFT);
            this.pinnedRightContainer = new HeaderContainer(this.gridPanel.getPinnedRightHeader(), null, this.eRoot, Column.PINNED_RIGHT);
            this.childContainers.push(this.pinnedLeftContainer);
            this.childContainers.push(this.pinnedRightContainer);
        }

        this.childContainers.forEach( container => this.context.wireBean(container) );

        // when grid columns change, it means the number of rows in the header has changed and it's all new columns
        this.eventService.addEventListener(Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));

        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshHeader.bind(this));

        // for resized, the individual cells take care of this, so don't need to refresh everything
        this.eventService.addEventListener(Events.EVENT_COLUMN_RESIZED, this.setPinnedColContainerWidth.bind(this));
        this.eventService.addEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.setPinnedColContainerWidth.bind(this));
        this.eventService.addEventListener(Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));

        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    }

    private onScrollVisibilityChanged(): void {
        this.setPinnedColContainerWidth();
    }

    public forEachHeaderElement(callback: (renderedHeaderElement: Component)=>void): void {
        this.childContainers.forEach( childContainer => childContainer.forEachHeaderElement(callback) );
    }
    
    @PreDestroy
    private destroy(): void {
        this.childContainers.forEach( container => container.destroy() );
    }

    private onGridColumnsChanged(): void {
        this.setHeight();
    }

    // this is called from the API and refreshes everything, should be broken out
    // into refresh everything vs just something changed
    public refreshHeader() {

        this.setHeight();

        this.childContainers.forEach( container => container.refresh() );

        this.setPinnedColContainerWidth();
    }

    private setHeight(): void {
        // if forPrint, overlay is missing
        if (this.eHeaderOverlay) {
            var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
            // we can probably get rid of this when we no longer need the overlay
            var dept = this.columnController.getHeaderRowCount();
            this.eHeaderOverlay.style.height = rowHeight + 'px';
            this.eHeaderOverlay.style.top = ((dept-1) * rowHeight) + 'px';
        }
    }
    
    public setPinnedColContainerWidth() {
        // pinned col doesn't exist when doing forPrint
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        let pinnedLeftWidthWithScroll = this.scrollVisibleService.getPinnedLeftWithScrollWidth();
        let pinnedRightWidthWithScroll = this.scrollVisibleService.getPinnedRightWithScrollWidth();

        this.eHeaderViewport.style.marginLeft = pinnedLeftWidthWithScroll + 'px';
        this.eHeaderViewport.style.marginRight = pinnedRightWidthWithScroll + 'px';
    }

}
