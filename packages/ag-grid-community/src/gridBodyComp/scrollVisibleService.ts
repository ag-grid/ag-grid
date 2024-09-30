import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import { _getScrollbarWidth } from '../utils/browser';

export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}

export class ScrollVisibleService extends BeanStub implements NamedBean {
    beanName = 'scrollVisibleService' as const;

    private ctrlsService: CtrlsService;
    private columnAnimationService?: ColumnAnimationService;

    // we store this locally, so we are not calling getScrollWidth() multiple times as it's an expensive operation
    private scrollbarWidth: number;

    public wireBeans(beans: BeanCollection) {
        this.ctrlsService = beans.ctrlsService;
        this.columnAnimationService = beans.columnAnimationService;
    }

    private horizontalScrollShowing: boolean;
    private verticalScrollShowing: boolean;

    private horizontalScrollGap: boolean;
    private verticalScrollGap: boolean;

    public postConstruct(): void {
        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();

        this.addManagedEventListeners({
            displayedColumnsChanged: this.onDisplayedColumnsChanged.bind(this),
            displayedColumnsWidthChanged: this.onDisplayedColumnsWidthChanged.bind(this),
        });
    }

    public onDisplayedColumnsChanged(): void {
        this.updateScrollVisible();
    }

    private onDisplayedColumnsWidthChanged(): void {
        this.updateScrollVisible();
    }

    public onCentreViewportResized(): void {
        this.updateScrollGap();
    }

    private updateScrollVisible(): void {
        // Because of column animation, if user removes cols anywhere except at the RHS,
        // then the cols on the RHS will animate to the left to fill the gap. This animation
        // means just after the cols are removed, the remaining cols are still in the original
        // location at the start of the animation, so pre animation the H scrollbar is still
        // needed, but post animation it is not. So if animation is active, we only update
        // after the animation has ended.
        if (this.columnAnimationService?.isActive()) {
            this.columnAnimationService.executeLaterVMTurn(() => {
                this.columnAnimationService!.executeLaterVMTurn(() => this.updateScrollVisibleImpl());
            });
        } else {
            this.updateScrollVisibleImpl();
        }
    }

    private updateScrollVisibleImpl(): void {
        const centerRowCtrl = this.ctrlsService.get('center');

        if (!centerRowCtrl || this.columnAnimationService?.isActive()) {
            return;
        }

        const params: SetScrollsVisibleParams = {
            horizontalScrollShowing: centerRowCtrl.isHorizontalScrollShowing(),
            verticalScrollShowing: this.isVerticalScrollShowing(),
        };

        this.setScrollsVisible(params);
        this.updateScrollGap();
    }

    private updateScrollGap(): void {
        const centerRowCtrl = this.ctrlsService.get('center');
        const horizontalGap = centerRowCtrl.hasHorizontalScrollGap();
        const verticalGap = centerRowCtrl.hasVerticalScrollGap();
        const atLeastOneDifferent =
            this.horizontalScrollGap !== horizontalGap || this.verticalScrollGap !== verticalGap;
        if (atLeastOneDifferent) {
            this.horizontalScrollGap = horizontalGap;
            this.verticalScrollGap = verticalGap;

            this.eventService.dispatchEvent({
                type: 'scrollGapChanged',
            });
        }
    }

    public setScrollsVisible(params: SetScrollsVisibleParams): void {
        const atLeastOneDifferent =
            this.horizontalScrollShowing !== params.horizontalScrollShowing ||
            this.verticalScrollShowing !== params.verticalScrollShowing;

        if (atLeastOneDifferent) {
            this.horizontalScrollShowing = params.horizontalScrollShowing;
            this.verticalScrollShowing = params.verticalScrollShowing;

            this.eventService.dispatchEvent({
                type: 'scrollVisibilityChanged',
            });
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

    public hasHorizontalScrollGap(): boolean {
        return this.horizontalScrollGap;
    }

    public hasVerticalScrollGap(): boolean {
        return this.verticalScrollGap;
    }

    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    public getScrollbarWidth() {
        if (this.scrollbarWidth == null) {
            const gridOptionsScrollbarWidth = this.gos.get('scrollbarWidth');
            const useGridOptions = typeof gridOptionsScrollbarWidth === 'number' && gridOptionsScrollbarWidth >= 0;
            const scrollbarWidth = useGridOptions ? gridOptionsScrollbarWidth : _getScrollbarWidth();

            if (scrollbarWidth != null) {
                this.scrollbarWidth = scrollbarWidth;

                this.eventService.dispatchEvent({
                    type: 'scrollbarWidthChanged',
                });
            }
        }

        return this.scrollbarWidth;
    }
}
