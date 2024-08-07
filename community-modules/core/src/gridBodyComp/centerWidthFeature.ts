import type { VisibleColsService } from '../columns/visibleColsService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { _isDomLayout } from '../gridOptionsUtils';
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

        this.addManagedEventListeners({
            columnContainerWidthChanged: listener,
            displayedColumnsChanged: listener,
            leftPinnedWidthChanged: listener,
        });

        if (this.addSpacer) {
            this.addManagedEventListeners({
                rightPinnedWidthChanged: listener,
                scrollVisibilityChanged: listener,
                scrollbarWidthChanged: listener,
            });
        }

        this.setWidth();
    }

    private setWidth(): void {
        const printLayout = _isDomLayout(this.gos, 'print');

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
                    totalWidth += this.scrollVisibleService.getScrollbarWidth();
                }
            }
        }

        this.callback(totalWidth);
    }
}
