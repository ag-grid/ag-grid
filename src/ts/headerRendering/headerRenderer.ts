import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {GridPanel} from "../gridPanel/gridPanel";
import {Column} from "../entities/column";
import {Bean, Autowired, Context, PostConstruct} from "../context/context";
import {HeaderContainer} from "./headerContainer";
import {EventService} from "../eventService";
import {Events} from "../events";

@Bean('headerRenderer')
export class HeaderRenderer {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('context') private context: Context;
    @Autowired('eventService') private eventService: EventService;

    private pinnedLeftContainer: HeaderContainer;
    private pinnedRightContainer: HeaderContainer;
    private centerContainer: HeaderContainer;

    private eHeaderViewport: HTMLElement;
    private eRoot: HTMLElement;
    private eHeaderOverlay: HTMLElement;

    @PostConstruct
    private init() {
        this.eHeaderViewport = this.gridPanel.getHeaderViewport();
        this.eRoot = this.gridPanel.getRoot();
        this.eHeaderOverlay = this.gridPanel.getHeaderOverlay();

        this.pinnedLeftContainer = new HeaderContainer(this.gridPanel.getPinnedLeftHeader(), null, this.eRoot, Column.PINNED_LEFT);
        this.pinnedRightContainer = new HeaderContainer(this.gridPanel.getPinnedRightHeader(), null, this.eRoot, Column.PINNED_RIGHT);
        this.centerContainer = new HeaderContainer(this.gridPanel.getHeaderContainer(), this.gridPanel.getHeaderViewport(), this.eRoot, null);

        this.context.wireBean(this.pinnedLeftContainer);
        this.context.wireBean(this.pinnedRightContainer);
        this.context.wireBean(this.centerContainer);

        // unlike the table data, the header more often 'refreshes everything' as a way to redraw, rather than
        // do delta changes based on the event. this is because groups have bigger impacts, eg a column move
        // can end up in a group splitting into two, or joining into one. this complexity makes the job much
        // harder to do delta updates. instead we just shotgun - which is fine, as the header is relatively
        // small compared to the body, so the cpu cost is low in comparison. it does mean we don't get any
        // animations.

        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.refreshHeader.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(Events.EVENT_HEADER_HEIGHT_CHANGED, this.refreshHeader.bind(this));
        this.eventService.addEventListener(Events.EVENT_PIVOT_VALUE_CHANGED, this.refreshHeader.bind(this));

        // for resized, the individual cells take care of this, so don't need to refresh everything
        this.eventService.addEventListener(Events.EVENT_COLUMN_RESIZED, this.setPinnedColContainerWidth.bind(this));

        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    }

    // this is called from the API and refreshes everything, should be broken out
    // into refresh everything vs just something changed
    public refreshHeader() {
        this.pinnedLeftContainer.removeAllChildren();
        this.pinnedRightContainer.removeAllChildren();
        this.centerContainer.removeAllChildren();

        this.pinnedLeftContainer.insertHeaderRowsIntoContainer();
        this.pinnedRightContainer.insertHeaderRowsIntoContainer();
        this.centerContainer.insertHeaderRowsIntoContainer();

        // if forPrint, overlay is missing
        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();

        // we can probably get rid of this when we no longer need the overlay
        var dept = this.columnController.getColumnDept();
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.style.height = rowHeight + 'px';
            this.eHeaderOverlay.style.top = ((dept-1) * rowHeight) + 'px';
        }

        this.setPinnedColContainerWidth();
    }

    public setPinnedColContainerWidth() {
        if (this.gridOptionsWrapper.isForPrint()) {
            // pinned col doesn't exist when doing forPrint
            return;
        }

        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
        this.eHeaderViewport.style.marginLeft = pinnedLeftWidth;

        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
        this.eHeaderViewport.style.marginRight = pinnedRightWidth;
    }

    public onIndividualColumnResized(column: Column): void {
        this.pinnedLeftContainer.onIndividualColumnResized(column);
        this.pinnedRightContainer.onIndividualColumnResized(column);
        this.centerContainer.onIndividualColumnResized(column);
    }
}
