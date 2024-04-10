import { BeanStub } from "../../context/beanStub";
import { PostConstruct } from "../../context/context";
import { Column } from "../../entities/column";

export class HoverFeature extends BeanStub {

    private readonly columns: Column[];

    private element: HTMLElement;

    constructor(columns: Column[], element: HTMLElement) {
        super();
        this.columns = columns;
        this.element = element;
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.beans.gos.get('columnHoverHighlight')) {
            this.addMouseHoverListeners();
        }
    }

    private addMouseHoverListeners(): void {
        this.addManagedListener(this.element, 'mouseout', this.onMouseOut.bind(this));
        this.addManagedListener(this.element, 'mouseover', this.onMouseOver.bind(this));
    }

    private onMouseOut(): void {
        this.beans.columnHoverService.clearMouseOver();
    }

    private onMouseOver(): void {
        this.beans.columnHoverService.setMouseOver(this.columns);
    }

}
