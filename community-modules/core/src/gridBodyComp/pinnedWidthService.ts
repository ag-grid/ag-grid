import type { VisibleColsService } from '../columns/visibleColsService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { _isDomLayout } from '../gridOptionsUtils';

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
        this.addManagedEventListeners({
            displayedColumnsChanged: listener,
            displayedColumnsWidthChanged: listener,
        });
        this.addManagedPropertyListener('domLayout', listener);
    }

    private checkContainerWidths() {
        const printLayout = _isDomLayout(this.gos, 'print');

        const newLeftWidth = printLayout ? 0 : this.visibleColsService.getColsLeftWidth();
        const newRightWidth = printLayout ? 0 : this.visibleColsService.getDisplayedColumnsRightWidth();

        if (newLeftWidth != this.leftWidth) {
            this.leftWidth = newLeftWidth;
            this.eventService.dispatchEvent({ type: 'leftPinnedWidthChanged' });
        }

        if (newRightWidth != this.rightWidth) {
            this.rightWidth = newRightWidth;
            this.eventService.dispatchEvent({ type: 'rightPinnedWidthChanged' });
        }
    }

    public getPinnedRightWidth(): number {
        return this.rightWidth;
    }

    public getPinnedLeftWidth(): number {
        return this.leftWidth;
    }
}
