import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { EventsType } from '../eventKeys';
import type { ScrollVisibilityChangedEvent } from '../events';
import { Events } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';

export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}

export class ScrollVisibleService extends BeanStub implements NamedBean {
    beanName = 'scrollVisibleService' as const;

    private ctrlsService: CtrlsService;
    private columnAnimationService: ColumnAnimationService;

    public wireBeans(beans: BeanCollection) {
        this.ctrlsService = beans.ctrlsService;
        this.columnAnimationService = beans.columnAnimationService;
    }

    private horizontalScrollShowing: boolean;
    private verticalScrollShowing: boolean;

    public postConstruct(): void {
        this.addManagedListeners<EventsType>(this.eventService, {
            [Events.EVENT_DISPLAYED_COLUMNS_CHANGED]: this.onDisplayedColumnsChanged.bind(this),
            [Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED]: this.onDisplayedColumnsWidthChanged.bind(this),
        });
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

        if (!centerRowCtrl || this.columnAnimationService.isActive()) {
            return;
        }

        const params: SetScrollsVisibleParams = {
            horizontalScrollShowing: centerRowCtrl.isHorizontalScrollShowing(),
            verticalScrollShowing: this.isVerticalScrollShowing(),
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
                type: Events.EVENT_SCROLL_VISIBILITY_CHANGED,
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
