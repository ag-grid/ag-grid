import { BeanStub } from "../../context/beanStub";
import { missing } from "../../utils/generic";
import { Autowired, Optional, PostConstruct } from "../../context/context";
import { IRangeService } from "../../interfaces/IRangeService";
import { DragListenerParams, DragService } from "../../dragAndDrop/dragService";

export class DragListenerFeature extends BeanStub {

    @Optional('rangeService') private rangeService: IRangeService;
    @Autowired('dragService') private dragService: DragService;

    private eContainer: HTMLElement;

    constructor(eContainer: HTMLElement) {
        super();
        this.eContainer = eContainer;
    }

    @PostConstruct
    private postConstruct(): void {
        if (
            !this.gridOptionsWrapper.isEnableRangeSelection() || // no range selection if no property
            missing(this.rangeService) // no range selection if not enterprise version
        ) {
            return;
        }

        const params: DragListenerParams = {
            eElement: this.eContainer,
            onDragStart: this.rangeService.onDragStart.bind(this.rangeService),
            onDragStop: this.rangeService.onDragStop.bind(this.rangeService),
            onDragging: this.rangeService.onDragging.bind(this.rangeService)
        };

        this.dragService.addDragSource(params);
        this.addDestroyFunc(() => this.dragService.removeDragSource(params));
    }

}