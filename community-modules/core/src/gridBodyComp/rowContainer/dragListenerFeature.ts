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

    private params: DragListenerParams;

    @PostConstruct
    private postConstruct(): void {
        if (missing(this.rangeService)) {
            return;
        }

        this.params = {
            eElement: this.eContainer,
            onDragStart: this.rangeService.onDragStart.bind(this.rangeService),
            onDragStop: this.rangeService.onDragStop.bind(this.rangeService),
            onDragging: this.rangeService.onDragging.bind(this.rangeService)
        };

        this.addManagedPropertyListener('enableRangeSelection', (props) => {
            const isEnabled = props.currentValue;
            if (isEnabled) {
                this.enableFeature();
                return;
            }
            this.disableFeature();
        });

        this.addDestroyFunc(() => this.disableFeature());

        const isRangeSelection = this.gos.get('enableRangeSelection');
        if (isRangeSelection) {
            this.enableFeature();
        }
    }

    private enableFeature() {
        this.dragService.addDragSource(this.params);
    }

    private disableFeature() {
        this.dragService.removeDragSource(this.params);
    }
}