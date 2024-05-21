import { BeanStub } from '../../context/beanStub';
import { Autowired, Optional } from '../../context/context';
import { DragListenerParams, DragService } from '../../dragAndDrop/dragService';
import { IRangeService } from '../../interfaces/IRangeService';

export class DragListenerFeature extends BeanStub {
    @Autowired('dragService') private dragService: DragService;
    @Optional('rangeService') private rangeService?: IRangeService;

    private eContainer: HTMLElement;

    constructor(eContainer: HTMLElement) {
        super();
        this.eContainer = eContainer;
    }

    private params: DragListenerParams;

    protected override postConstruct(): void {
        super.postConstruct();
        if (!this.rangeService) {
            return;
        }

        this.params = {
            eElement: this.eContainer,
            onDragStart: this.rangeService.onDragStart.bind(this.rangeService),
            onDragStop: this.rangeService.onDragStop.bind(this.rangeService),
            onDragging: this.rangeService.onDragging.bind(this.rangeService),
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
