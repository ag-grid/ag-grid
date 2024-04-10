import { BeanStub } from "../../context/beanStub";
import { PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
import { setDisplayed, setFixedWidth } from "../../utils/dom";

export class SetPinnedRightWidthFeature extends BeanStub {

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedEventListener(Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, this.onPinnedRightWidthChanged.bind(this));
    }

    private onPinnedRightWidthChanged(): void {
        const rightWidth = this.beans.pinnedWidthService.getPinnedRightWidth();
        const displayed = rightWidth > 0;
        setDisplayed(this.element, displayed);
        setFixedWidth(this.element, rightWidth);
    }

    public getWidth(): number {
        return this.beans.pinnedWidthService.getPinnedRightWidth();
    }
}