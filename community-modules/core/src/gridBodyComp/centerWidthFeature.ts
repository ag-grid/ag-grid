import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { ColumnModel } from "../columns/columnModel";
import { Events } from "../eventKeys";
import { ScrollVisibleService } from "./scrollVisibleService";

export class CenterWidthFeature extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

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
        const {columnModel} = this;

        const printLayout = this.gos.isDomLayout('print');

        const centerWidth = columnModel.getBodyContainerWidth();
        const leftWidth = columnModel.getDisplayedColumnsLeftWidth();
        const rightWidth = columnModel.getDisplayedColumnsRightWidth();

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