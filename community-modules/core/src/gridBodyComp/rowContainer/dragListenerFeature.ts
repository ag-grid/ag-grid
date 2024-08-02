import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { DragListenerParams, DragService } from '../../dragAndDrop/dragService';
import type { IRangeService } from '../../interfaces/IRangeService';

export class DragListenerFeature extends BeanStub {
    private dragService: DragService;
    private rangeService?: IRangeService;

    public wireBeans(beans: BeanCollection) {
        this.dragService = beans.dragService;
        this.rangeService = beans.rangeService;
    }

    private eContainer: HTMLElement;

    constructor(eContainer: HTMLElement) {
        super();
        this.eContainer = eContainer;
    }

    private params: DragListenerParams;

    public postConstruct(): void {
        if (!this.rangeService) {
            return;
        }

        this.params = {
            eElement: this.eContainer,
            onDragStart: this.rangeService.onDragStart.bind(this.rangeService),
            onDragStop: this.rangeService.onDragStop.bind(this.rangeService),
            onDragging: this.rangeService.onDragging.bind(this.rangeService),
        };

        this.addManagedPropertyListeners(['enableRangeSelection', 'selectionOptions'], () => {
            const isEnabled = this.gos.getLegacySelectionOption('enableRangeSelection');
            if (isEnabled) {
                this.enableFeature();
            } else {
                this.disableFeature();
            }
        });

        this.addDestroyFunc(() => this.disableFeature());

        const isRangeSelection = this.gos.getLegacySelectionOption('enableRangeSelection');
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
