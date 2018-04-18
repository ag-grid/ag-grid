import {Bean, Autowired, PostConstruct} from "../context/context";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";
import {Events, ScrollVisibilityChangedEvent} from "../events";
import {ColumnController} from "../columnController/columnController";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export interface SetScrollsVisibleParams {
    vBody: boolean;
    hBody: boolean;
    vLeft: boolean;
    vRight: boolean;
}

@Bean('scrollVisibleService')
export class ScrollVisibleService {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private scrollWidth: number;

    private vBody: boolean;
    private hBody: boolean;

    private vLeft: boolean;
    private vRight: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
    }

    public setScrollsVisible(params: SetScrollsVisibleParams): void {

        let atLeastOneDifferent =
            this.vBody !== params.vBody
            || this.hBody !== params.hBody
            || this.vLeft !== params.vLeft
            || this.vRight !== params.vRight;

        if (atLeastOneDifferent) {
            this.vBody = params.vBody;
            this.hBody = params.hBody;
            this.vLeft = params.vLeft;
            this.vRight = params.vRight;

            let event: ScrollVisibilityChangedEvent = {
                type: Events.EVENT_SCROLL_VISIBILITY_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }

    }

    public isVBodyShowing(): boolean {
        return this.vBody;
    }

    public isHBodyShowing(): boolean {
        return this.hBody;
    }

    public getPinnedLeftWithScrollWidth(): number {
        let result = this.columnController.getPinnedLeftContainerWidth();
        if (this.vLeft) {
            result += this.scrollWidth;
        }
        return result;
    }

    public getPinnedRightWithScrollWidth(): number {
        let result = this.columnController.getPinnedRightContainerWidth();
        if (this.vRight) {
            result += this.scrollWidth;
        }
        return result;
    }
}
