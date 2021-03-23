import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { ScrollVisibleService } from "../../gridBodyComp/scrollVisibleService";
import { Events } from "../../eventKeys";
import { RowContainerNames } from "./rowContainerComp";

export interface RowContainerView {
    setViewportHeight(height: string): void;
}

export class RowContainerController extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

    private view: RowContainerView;
    private name: string;

    constructor(view: RowContainerView, name: string) {
        super();
        this.view = view;
        this.name = name;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
    }

    private onScrollVisibilityChanged(): void {
        if (this.name!==RowContainerNames.CENTER) { return; }

        const visible = this.scrollVisibleService.isHorizontalScrollShowing();
        const scrollbarWidth = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const height = scrollbarWidth == 0 ? '100%' : `calc(100% + ${scrollbarWidth}px)`;
        this.view.setViewportHeight(height);
    }

}