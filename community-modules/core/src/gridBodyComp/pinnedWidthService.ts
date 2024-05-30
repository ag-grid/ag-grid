import type { VisibleColsService } from '../columns/visibleColsService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { Events } from '../eventKeys';
import type { EventsType } from '../eventKeys';

export class PinnedWidthService extends BeanStub implements NamedBean {
    beanName = 'pinnedWidthService' as const;

    private visibleColsService: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
    }

    private leftWidth: number;
    private rightWidth: number;

    public postConstruct(): void {
        const listener = this.checkContainerWidths.bind(this);
        this.addManagedListeners<EventsType>(this.eventService, {
            [Events.EVENT_DISPLAYED_COLUMNS_CHANGED]: listener,
            [Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED]: listener,
        });
        this.addManagedPropertyListener('domLayout', listener);
    }

    private checkContainerWidths() {
        const printLayout = this.gos.isDomLayout('print');

        const newLeftWidth = printLayout ? 0 : this.visibleColsService.getColsLeftWidth();
        const newRightWidth = printLayout ? 0 : this.visibleColsService.getDisplayedColumnsRightWidth();

        if (newLeftWidth != this.leftWidth) {
            this.leftWidth = newLeftWidth;
            this.eventService.dispatchEvent({ type: Events.EVENT_LEFT_PINNED_WIDTH_CHANGED });
        }

        if (newRightWidth != this.rightWidth) {
            this.rightWidth = newRightWidth;
            this.eventService.dispatchEvent({ type: Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED });
        }
    }

    public getPinnedRightWidth(): number {
        return this.rightWidth;
    }

    public getPinnedLeftWidth(): number {
        return this.leftWidth;
    }
}
