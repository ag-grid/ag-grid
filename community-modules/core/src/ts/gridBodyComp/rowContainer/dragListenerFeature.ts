import { BeanStub } from "../../context/beanStub";
import { missing } from "../../utils/generic";
import { Autowired, Optional, PostConstruct } from "../../context/context";
import { IRangeController } from "../../interfaces/iRangeController";
import { DragListenerParams, DragService } from "../../dragAndDrop/dragService";

export class DragListenerFeature extends BeanStub {

    @Optional('rangeController') private rangeController: IRangeController;
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
            missing(this.rangeController) // no range selection if not enterprise version
        ) {
            return;
        }

        const params: DragListenerParams = {
            eElement: this.eContainer,
            onDragStart: this.rangeController.onDragStart.bind(this.rangeController),
            onDragStop: this.rangeController.onDragStop.bind(this.rangeController),
            onDragging: this.rangeController.onDragging.bind(this.rangeController)
        };

        this.dragService.addDragSource(params);
        this.addDestroyFunc(() => this.dragService.removeDragSource(params));
    }

}