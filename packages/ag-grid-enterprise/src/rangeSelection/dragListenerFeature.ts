import type { BeanCollection, DragListenerParams, DragService, IRangeService } from 'ag-grid-community';
import { BeanStub, _isCellSelectionEnabled } from 'ag-grid-community';

export class DragListenerFeature extends BeanStub {
    private dragSvc: DragService;
    private rangeService: IRangeService;

    public wireBeans(beans: BeanCollection) {
        this.dragSvc = beans.dragSvc!;
        this.rangeService = beans.rangeService!;
    }

    private eContainer: HTMLElement;

    constructor(eContainer: HTMLElement) {
        super();
        this.eContainer = eContainer;
    }

    private params: DragListenerParams;

    public postConstruct(): void {
        this.params = {
            eElement: this.eContainer,
            onDragStart: this.rangeService.onDragStart.bind(this.rangeService),
            onDragStop: this.rangeService.onDragStop.bind(this.rangeService),
            onDragging: this.rangeService.onDragging.bind(this.rangeService),
        };

        this.addManagedPropertyListeners(['enableRangeSelection', 'cellSelection'], () => {
            const isEnabled = _isCellSelectionEnabled(this.gos);
            if (isEnabled) {
                this.enableFeature();
            } else {
                this.disableFeature();
            }
        });

        this.addDestroyFunc(() => this.disableFeature());

        const isRangeSelection = _isCellSelectionEnabled(this.gos);
        if (isRangeSelection) {
            this.enableFeature();
        }
    }

    private enableFeature() {
        this.dragSvc.addDragSource(this.params);
    }

    private disableFeature() {
        this.dragSvc.removeDragSource(this.params);
    }
}
