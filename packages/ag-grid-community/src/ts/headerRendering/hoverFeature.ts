import {Column} from "../entities/column";
import {BeanStub} from "../context/beanStub";
import {Autowired} from "../context/context";
import {ColumnHoverService} from "../rendering/columnHoverService";

export class HoverFeature extends BeanStub {

    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;

    private columns: Column[];

    constructor(columns: Column[], element: HTMLElement) {
        super();
        this.columns = columns;
        this.addMouseHoverListeners(element);
    }

    private addMouseHoverListeners(element: HTMLElement): void {
        this.addDestroyableEventListener(element, 'mouseout', this.onMouseOut.bind(this));
        this.addDestroyableEventListener(element, 'mouseover', this.onMouseOver.bind(this));
    }

    private onMouseOut(): void {
        this.columnHoverService.clearMouseOver();
    }

    private onMouseOver(): void {
        this.columnHoverService.setMouseOver(this.columns);
    }

}