import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { ColumnModel } from "../columns/columnModel";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { Events } from "../eventKeys";

export class CenterWidthFeature extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;

    private callback: (width: number) => void;

    constructor(callback: (width: number) => void) {
        super();
        this.callback = callback;
    }

    @PostConstruct
    private postConstruct(): void {
        const listener = this.setWidth.bind(this);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, listener);

        this.setWidth();
    }

    private setWidth(): void {
        const {columnModel} = this;

        const printLayout = this.gridOptionsWrapper.getDomLayout() === 'print';

        const centerWidth = columnModel.getBodyContainerWidth();
        const leftWidth = columnModel.getDisplayedColumnsLeftWidth();
        const rightWidth = columnModel.getDisplayedColumnsRightWidth();

        const totalWidth = printLayout ? centerWidth + leftWidth + rightWidth : centerWidth;

        this.callback(totalWidth);
    }
}