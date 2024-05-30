import type { VisibleColsService } from '../columns/visibleColsService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { Events } from '../eventKeys';
import type { ScrollVisibleService } from './scrollVisibleService';

export class CenterWidthFeature extends BeanStub {
    private visibleColsService: VisibleColsService;
    private scrollVisibleService: ScrollVisibleService;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
        this.scrollVisibleService = beans.scrollVisibleService;
    }

    constructor(
        private readonly callback: (width: number) => void,
        private readonly addSpacer: boolean = false
    ) {
        super();
    }

    public postConstruct(): void {
        const listener = this.setWidth.bind(this);
        this.addManagedPropertyListener('domLayout', listener);

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_CONTAINER_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, listener);

        if (this.addSpacer) {
            this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, listener);
            this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, listener);
            this.addManagedListener(this.eventService, Events.EVENT_SCROLLBAR_WIDTH_CHANGED, listener);
        }

        this.setWidth();
    }

    private setWidth(): void {
        const printLayout = this.gos.isDomLayout('print');

        const centerWidth = this.visibleColsService.getBodyContainerWidth();
        const leftWidth = this.visibleColsService.getColsLeftWidth();
        const rightWidth = this.visibleColsService.getDisplayedColumnsRightWidth();

        let totalWidth: number;

        if (printLayout) {
            totalWidth = centerWidth + leftWidth + rightWidth;
        } else {
            totalWidth = centerWidth;

            if (this.addSpacer) {
                const relevantWidth = this.gos.get('enableRtl') ? leftWidth : rightWidth;
                if (relevantWidth === 0 && this.scrollVisibleService.isVerticalScrollShowing()) {
                    totalWidth += this.gos.getScrollbarWidth();
                }
            }
        }

        this.callback(totalWidth);
    }
}
