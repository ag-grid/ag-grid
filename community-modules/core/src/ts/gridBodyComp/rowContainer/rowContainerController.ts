import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { ScrollVisibleService } from "../../gridBodyComp/scrollVisibleService";
import { Events } from "../../eventKeys";
import { RowContainerNames } from "./rowContainerComp";
import { RowContainerEventsFeature } from "./rowContainerEventsFeature";
import { DragService } from "../../dragAndDrop/dragService";

export interface RowContainerView {
    setViewportHeight(height: string): void;
}

export class RowContainerController extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('dragService') private dragService: DragService;

    private view: RowContainerView;
    private name: string;
    private eContainer: HTMLElement;

    constructor(name: string) {
        super();
        this.name = name;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
    }

    public setView(view: RowContainerView, eContainer: HTMLElement): void {
        this.view = view;
        this.eContainer = eContainer;

        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
    }

    private onScrollVisibilityChanged(): void {
        if (this.name!==RowContainerNames.CENTER) { return; }

        const visible = this.scrollVisibleService.isHorizontalScrollShowing();
        const scrollbarWidth = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const height = scrollbarWidth == 0 ? '100%' : `calc(100% + ${scrollbarWidth}px)`;
        this.view.setViewportHeight(height);
    }

    // this methods prevents the grid views from being scrolled while the dragService is being used
    // eg. the view should not scroll up and down while dragging rows using the rowDragComp.
    private addPreventScrollWhileDragging(): void {
        const preventScroll = (e: TouchEvent) => {
            if (this.dragService.isDragging()) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        this.eContainer.addEventListener('touchmove', preventScroll, { passive: false });
        this.addDestroyFunc(() => this.eContainer.removeEventListener('touchmove', preventScroll) );
    }

}