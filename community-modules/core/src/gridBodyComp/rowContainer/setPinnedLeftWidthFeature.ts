import { BeanStub } from "../../context/beanStub";
import { PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
import { setDisplayed, setFixedWidth } from "../../utils/dom";

export class SetPinnedLeftWidthFeature extends BeanStub {

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedEventListener(Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, this.onPinnedLeftWidthChanged.bind(this));
    }

    private onPinnedLeftWidthChanged(): void {
        const leftWidth = this.beans.pinnedWidthService.getPinnedLeftWidth();
        const displayed = leftWidth > 0;
        setDisplayed(this.element, displayed);
        setFixedWidth(this.element, leftWidth);
    }

    public getWidth(): number {
        return this.beans.pinnedWidthService.getPinnedLeftWidth();
    }

}