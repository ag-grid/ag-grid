import type { VisibleColsService } from '../columns/visibleColsService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection, BeanName } from '../context/context';
import { Events } from '../eventKeys';

export class PinnedWidthService extends BeanStub {
    beanName: BeanName = 'pinnedWidthService';

    private visibleColsService: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.visibleColsService = beans.visibleColsService;
    }

    private leftWidth: number;
    private rightWidth: number;

    public postConstruct(): void {
        const listener = this.checkContainerWidths.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, listener);
        this.gos.addManagedPropertyListener('domLayout', listener);
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
