import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { ColumnHoverService } from "../../rendering/columnHoverService";

export class HoverFeature extends BeanStub {

    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;

    readonly #columns: Column[];

    #element: HTMLElement;

    constructor(columns: Column[], element: HTMLElement) {
        super();
        this.#columns = columns;
        this.#element = element;
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gos.get('columnHoverHighlight')) {
            this.#addMouseHoverListeners();
        }
    }

    #addMouseHoverListeners(): void {
        this.addManagedListener(this.#element, 'mouseout', this.#onMouseOut.bind(this));
        this.addManagedListener(this.#element, 'mouseover', this.#onMouseOver.bind(this));
    }

    #onMouseOut(): void {
        this.columnHoverService.clearMouseOver();
    }

    #onMouseOver(): void {
        this.columnHoverService.setMouseOver(this.#columns);
    }

}
