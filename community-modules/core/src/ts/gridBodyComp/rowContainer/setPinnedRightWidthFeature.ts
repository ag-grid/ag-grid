import { Autowired, PostConstruct } from "../../context/context";
import { PinnedWidthService } from "../pinnedWidthService";
import { Events } from "../../eventKeys";
import { setDisplayed, setFixedWidth } from "../../utils/dom";
import { BeanStub } from "../../context/beanStub";

export class SetPinnedRightWidthFeature extends BeanStub {

    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, this.onPinnedRightWidthChanged.bind(this));
    }

    private onPinnedRightWidthChanged(): void {
        const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
        const displayed = rightWidth > 0;
        setDisplayed(this.element, displayed);
        if (displayed) {
            setFixedWidth(this.element, rightWidth);
        }
    }

    public getWidth(): number {
        return this.pinnedWidthService.getPinnedRightWidth();
    }
}