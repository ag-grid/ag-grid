import { BeanStub } from "../../context/beanStub";
import { PostConstruct } from "../../context/context";
import { DragListenerParams } from "../../dragAndDrop/dragService";

export class DragListenerFeature extends BeanStub {

    private eContainer: HTMLElement;

    constructor(eContainer: HTMLElement) {
        super();
        this.eContainer = eContainer;
    }

    private params: DragListenerParams;

    @PostConstruct
    private postConstruct(): void {
        const { rangeService } = this.beans;
        if (!rangeService) {
            return;
        }

        this.params = {
            eElement: this.eContainer,
            onDragStart: rangeService.onDragStart.bind(rangeService),
            onDragStop: rangeService.onDragStop.bind(rangeService),
            onDragging: rangeService.onDragging.bind(rangeService)
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

        const isRangeSelection = this.beans.gos.get('enableRangeSelection');
        if (isRangeSelection) {
            this.enableFeature();
        }
    }

    private enableFeature() {
        this.beans.dragService.addDragSource(this.params);
    }

    private disableFeature() {
        this.beans.dragService.removeDragSource(this.params);
    }
}