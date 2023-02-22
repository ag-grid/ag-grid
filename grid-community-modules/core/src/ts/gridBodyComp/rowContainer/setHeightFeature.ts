import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { RowContainerHeightService } from "../../rendering/rowContainerHeightService";
import { Events } from "../../eventKeys";

export class SetHeightFeature extends BeanStub {

    @Autowired("rowContainerHeightService") private maxDivHeightScaler: RowContainerHeightService;

    private eContainer: HTMLElement;
    private eWrapper: HTMLElement | undefined;

    constructor(eContainer: HTMLElement, eWrapper?: HTMLElement) {
        super();
        this.eContainer = eContainer;
        this.eWrapper = eWrapper;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED, this.onHeightChanged.bind(this));
    }

    private onHeightChanged(): void {
        const height = this.maxDivHeightScaler.getUiContainerHeight();
        const heightString = height != null ? `${height}px` : ``;

        this.eContainer.style.height = heightString;
        if (this.eWrapper) {
            this.eWrapper.style.height = heightString;
        }
    }
}