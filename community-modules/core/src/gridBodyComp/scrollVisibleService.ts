import { Bean, Autowired, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { Events, ScrollVisibilityChangedEvent } from "../events";
import { CtrlsService } from "../ctrlsService";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { ColumnAnimationService } from "../rendering/columnAnimationService";

export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}

@Bean('scrollVisibleService')
export class ScrollVisibleService extends BeanStub {

    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('columnAnimationService') public columnAnimationService: ColumnAnimationService;

    private horizontalScrollShowing: boolean;
    private verticalScrollShowing: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));

    }

    public onDisplayedColumnsChanged(): void {
        this.update();
    }

    private onDisplayedColumnsWidthChanged(): void {
        this.update();
    }

    private update(): void {
        // Because of column animation, if user removes cols anywhere except at the RHS, 
        // then the cols on the RHS will animate to the left to fill the gap. This animation 
        // means just after the cols are removed, the remaining cols are still in the original
        // location at the start of the animation, so pre animation the H scrollbar is still
        // needed, but post animation it is not. So if animation is active, we only update
        // after the animation has ended.
        if (this.columnAnimationService.isActive()) {
            this.columnAnimationService.executeLaterVMTurn(() => {
                this.columnAnimationService.executeLaterVMTurn(() => this.updateImpl());
            });
        } else {
            this.updateImpl();
        }
    }

    private updateImpl(): void {
        const centerRowCtrl = this.ctrlsService.get('center');

        if (!centerRowCtrl || this.columnAnimationService.isActive()) { return; }

        const params: SetScrollsVisibleParams = {
            horizontalScrollShowing: centerRowCtrl.isHorizontalScrollShowing(),
            verticalScrollShowing: this.isVerticalScrollShowing()
        };

        this.setScrollsVisible(params);
    }

    public setScrollsVisible(params: SetScrollsVisibleParams): void {
        const atLeastOneDifferent =
            this.horizontalScrollShowing !== params.horizontalScrollShowing ||
            this.verticalScrollShowing !== params.verticalScrollShowing;

        if (atLeastOneDifferent) {
            this.horizontalScrollShowing = params.horizontalScrollShowing;
            this.verticalScrollShowing = params.verticalScrollShowing;

            const event: WithoutGridCommon<ScrollVisibilityChangedEvent> = {
                type: Events.EVENT_SCROLL_VISIBILITY_CHANGED
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
