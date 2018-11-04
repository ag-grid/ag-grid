import {Bean, Autowired, PostConstruct} from "../context/context";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";
import {Events, ScrollVisibilityChangedEvent} from "../events";
import {ColumnController} from "../columnController/columnController";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}

@Bean('scrollVisibleService')
export class ScrollVisibleService {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private horizontalScrollShowing: boolean;
    private verticalScrollShowing: boolean;

    public setScrollsVisible(params: SetScrollsVisibleParams): void {
        let atLeastOneDifferent =
            this.horizontalScrollShowing !== params.horizontalScrollShowing ||
            this.verticalScrollShowing !== params.verticalScrollShowing;

        if (atLeastOneDifferent) {
            this.horizontalScrollShowing = params.horizontalScrollShowing;
            this.verticalScrollShowing = params.verticalScrollShowing;

            let event: ScrollVisibilityChangedEvent = {
                type: Events.EVENT_SCROLL_VISIBILITY_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    // used by pagination service - to know page height
    public isHorizontalScrollShowing(): boolean {
        return this.horizontalScrollShowing;
    }

    // used by header container
    public isVerticalScrollShowing(): boolean {
        return this.verticalScrollShowing;
    }
}
