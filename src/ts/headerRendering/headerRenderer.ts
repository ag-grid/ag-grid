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

    @PostConstruct
    private init() {
        this.eHeaderViewport = this.gridPanel.getHeaderViewport();

        this.centerContainer = new HeaderContainer(this.gridPanel.getHeaderContainer(), this.gridPanel.getHeaderViewport(), null);
        this.childContainers = [this.centerContainer];

        this.pinnedLeftContainer = new HeaderContainer(this.gridPanel.getPinnedLeftHeader(), null, Column.PINNED_LEFT);
        this.pinnedRightContainer = new HeaderContainer(this.gridPanel.getPinnedRightHeader(), null, Column.PINNED_RIGHT);
        this.childContainers.push(this.pinnedLeftContainer);
        this.childContainers.push(this.pinnedRightContainer);

        this.childContainers.forEach( container => this.context.wireBean(container) );

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

    public refreshHeader() {
        this.childContainers.forEach( container => container.refresh() );
        this.setPinnedColContainerWidth();
    }


    public setPinnedColContainerWidth() {
        let pinnedLeftWidthWithScroll = this.scrollVisibleService.getPinnedLeftWithScrollWidth();
        let pinnedRightWidthWithScroll = this.scrollVisibleService.getPinnedRightWithScrollWidth();

        this.eHeaderViewport.style.marginLeft = pinnedLeftWidthWithScroll + 'px';
        this.eHeaderViewport.style.marginRight = pinnedRightWidthWithScroll + 'px';
    }

}
