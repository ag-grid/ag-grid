import {Bean, Autowired} from "../context/context";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";
import {Events, ScrollVisibilityChangedEvent} from "../events";
import {ColumnController} from "../columnController/columnController";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";

export interface SetScrollsVisibleParams {
    vBody: boolean;
    hBody: boolean;
    vPinnedLeft: boolean;
    vPinnedRight: boolean;
}

@Bean('scrollVisibleService')
export class ScrollVisibleService {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private vBody: boolean;
    private hBody: boolean;

    private vPinnedLeft: boolean;
    private vPinnedRight: boolean;

    public setScrollsVisible(params: SetScrollsVisibleParams): void {

        let atLeastOneDifferent =
            this.vBody !== params.vBody
            || this.hBody !== params.hBody
            || this.vPinnedLeft !== params.vPinnedLeft
            || this.vPinnedRight !== params.vPinnedRight;

        if (atLeastOneDifferent) {
            this.vBody = params.vBody;
            this.hBody = params.hBody;
            this.vPinnedLeft = params.vPinnedLeft;
            this.vPinnedRight = params.vPinnedRight;

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

    public isVPinnedLeftShowing(): boolean {
        return this.vPinnedLeft;
    }

    public isVPinnedRightShowing(): boolean {
        return this.vPinnedRight;
    }

    public getPinnedLeftWidth(): number {
        return this.columnController.getPinnedLeftContainerWidth();
    }

    public getPinnedLeftWithScrollWidth(): number {
        let result = this.getPinnedLeftWidth();
        if (this.vPinnedLeft) {
            result += _.getScrollbarWidth();
        }
        return result;
    }

    public getPinnedRightWidth(): number {
        return this.columnController.getPinnedRightContainerWidth();
    }

    public getPinnedRightWithScrollWidth(): number {
        let result = this.getPinnedRightWidth();
        if (this.vPinnedRight) {
            result += _.getScrollbarWidth();
        }
        return result;
    }
}
