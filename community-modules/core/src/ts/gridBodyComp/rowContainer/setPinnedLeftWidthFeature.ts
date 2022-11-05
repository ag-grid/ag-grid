import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
import { setDisplayed, setFixedWidth } from "../../utils/dom";
import { PinnedWidthService } from "../pinnedWidthService";

export class SetPinnedLeftWidthFeature extends BeanStub {

    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, this.onPinnedLeftWidthChanged.bind(this));
    }

    private onPinnedLeftWidthChanged(): void {
        const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
        const displayed = leftWidth > 0;
        setDisplayed(this.element, displayed);
        if (displayed) {
            setFixedWidth(this.element, leftWidth);
        }
    }

    public getWidth(): number {
        return this.pinnedWidthService.getPinnedLeftWidth();
    }

}