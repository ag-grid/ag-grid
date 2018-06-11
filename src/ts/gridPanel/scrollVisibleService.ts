import {Bean, Autowired, PostConstruct} from "../context/context";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";
import {Events, ScrollVisibilityChangedEvent} from "../events";
import {ColumnController} from "../columnController/columnController";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export interface SetScrollsVisibleParams {
    bodyHorizontalScrollShowing: boolean;
    leftVerticalScrollShowing: boolean;
    rightVerticalScrollShowing: boolean;
}

@Bean('scrollVisibleService')
export class ScrollVisibleService {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private bodyHorizontalScrollShowing: boolean;

    private leftVerticalScrollShowing: boolean;
    private rightVerticalScrollShowing: boolean;

    public setScrollsVisible(params: SetScrollsVisibleParams): void {

        let atLeastOneDifferent =
            this.bodyHorizontalScrollShowing !== params.bodyHorizontalScrollShowing ||
            this.leftVerticalScrollShowing !== params.leftVerticalScrollShowing ||
            this.rightVerticalScrollShowing !== params.rightVerticalScrollShowing;

        if (atLeastOneDifferent) {
            this.bodyHorizontalScrollShowing = params.bodyHorizontalScrollShowing;
            this.leftVerticalScrollShowing = params.leftVerticalScrollShowing;
            this.rightVerticalScrollShowing = params.rightVerticalScrollShowing;

            let event: ScrollVisibilityChangedEvent = {
                type: Events.EVENT_SCROLL_VISIBILITY_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    // used by pagination service - to know page height
    public isBodyHorizontalScrollShowing(): boolean {
        return this.bodyHorizontalScrollShowing;
    }

    // used by header container
    public isLeftVerticalScrollShowing(): boolean {
        return this.leftVerticalScrollShowing;
    }

    // used by header container
    public isRightVerticalScrollShowing(): boolean {
        return this.rightVerticalScrollShowing;
    }

}
