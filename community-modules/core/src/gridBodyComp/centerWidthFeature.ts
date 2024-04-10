import { BeanStub } from "../context/beanStub";
import { PostConstruct } from "../context/context";
import { Events } from "../eventKeys";

export class CenterWidthFeature extends BeanStub {

    constructor(
        private readonly callback: (width: number) => void,
        private readonly addSpacer: boolean = false
    ) {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        const listener = this.setWidth.bind(this);
        this.addManagedPropertyListener('domLayout', listener);

        this.addManagedEventListener(Events.EVENT_COLUMN_CONTAINER_WIDTH_CHANGED, listener);
        this.addManagedEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedEventListener(Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, listener);

        if (this.addSpacer) {
            this.addManagedEventListener(Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, listener);
            this.addManagedEventListener(Events.EVENT_SCROLL_VISIBILITY_CHANGED, listener);
            this.addManagedEventListener(Events.EVENT_SCROLLBAR_WIDTH_CHANGED, listener);
        }

        this.setWidth();
    }

    private setWidth(): void {
        const {columnModel, scrollVisibleService, gos } = this.beans;

        const printLayout = gos.isDomLayout('print');

        const centerWidth = columnModel.getBodyContainerWidth();
        const leftWidth = columnModel.getDisplayedColumnsLeftWidth();
        const rightWidth = columnModel.getDisplayedColumnsRightWidth();

        let totalWidth: number;

        if (printLayout) {
            totalWidth = centerWidth + leftWidth + rightWidth;
        } else {
            totalWidth = centerWidth;

            if (this.addSpacer) {
                const relevantWidth = gos.get('enableRtl') ? leftWidth : rightWidth;
                if (relevantWidth === 0 && scrollVisibleService.isVerticalScrollShowing()) {
                    totalWidth += gos.getScrollbarWidth();
                }
            }
        }

        this.callback(totalWidth);
    }
}