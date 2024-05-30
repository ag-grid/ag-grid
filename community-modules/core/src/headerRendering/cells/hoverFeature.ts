import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { ColumnHoverService } from '../../rendering/columnHoverService';

export class HoverFeature extends BeanStub {
    private columnHoverService: ColumnHoverService;

    public wireBeans(beans: BeanCollection): void {
        this.columnHoverService = beans.columnHoverService;
    }

    private readonly columns: AgColumn[];

    private element: HTMLElement;

    constructor(columns: AgColumn[], element: HTMLElement) {
        super();
        this.columns = columns;
        this.element = element;
    }

    public postConstruct(): void {
        if (this.gos.get('columnHoverHighlight')) {
            this.addMouseHoverListeners();
        }
    }

    private addMouseHoverListeners(): void {
        this.addManagedListener(this.element, 'mouseout', this.onMouseOut.bind(this));
        this.addManagedListener(this.element, 'mouseover', this.onMouseOver.bind(this));
    }

    private onMouseOut(): void {
        this.columnHoverService.clearMouseOver();
    }

    private onMouseOver(): void {
        this.columnHoverService.setMouseOver(this.columns);
    }
}
