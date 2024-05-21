import { BeanStub } from '../../context/beanStub';
import { Autowired } from '../../context/context';
import { Column } from '../../entities/column';
import { ColumnHoverService } from '../../rendering/columnHoverService';

export class HoverFeature extends BeanStub {
    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;

    private readonly columns: Column[];

    private element: HTMLElement;

    constructor(columns: Column[], element: HTMLElement) {
        super();
        this.columns = columns;
        this.element = element;
    }

    protected override postConstruct(): void {
        super.postConstruct();
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
