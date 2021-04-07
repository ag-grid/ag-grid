import { BeanStub } from "../context/beanStub";
import { getTarget, isStopPropagationForAgGrid } from "../utils/event";
import { Autowired, Bean, Optional } from "../context/context";
import { MouseEventService } from "./mouseEventService";
import { RowController } from "../rendering/row/rowController";
import { CellComp } from "../rendering/cellComp";
import { ValueService } from "../valueService/valueService";
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { isIOSUserAgent } from "../utils/browser";
import { LongTapEvent, TouchListener } from "../widgets/touchListener";
import { GridBodyController } from "./gridBodyController";

@Bean('bodyMouseEventsService')
export class BodyMouseEventsService extends BeanStub {

    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('valueService') private valueService: ValueService;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;

    private gridBodyCon: GridBodyController;

    constructor() {
        super();
    }

    public addElement(element: HTMLElement): void {
        this.addMouseListeners(element);
        this.mockContextMenuForIPad(element);
    }

    private addMouseListeners(element: HTMLElement): void {
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', 'mousedown'];

        eventNames.forEach(eventName => {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedListener(element, eventName, listener)
        });
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (
            !this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            isStopPropagationForAgGrid(mouseEvent)
        ) {
            return;
        }

        const rowComp = this.getRowForEvent(mouseEvent);
        const cellComp = this.mouseEventService.getRenderedCellForEvent(mouseEvent)!;

        if (eventName === "contextmenu") {
            this.handleContextMenuMouseEvent(mouseEvent, null, rowComp, cellComp);
        } else {
            if (cellComp) {
                cellComp.onMouseEvent(eventName, mouseEvent);
            }
            if (rowComp) {
                rowComp.onMouseEvent(eventName, mouseEvent);
            }
        }
    }

    private mockContextMenuForIPad(element: HTMLElement): void {
        // we do NOT want this when not in iPad, otherwise we will be doing
        if (!isIOSUserAgent()) { return; }

        const touchListener = new TouchListener(element);
        const longTapListener = (event: LongTapEvent) => {
            const rowComp = this.getRowForEvent(event.touchEvent);
            const cellComp = this.mouseEventService.getRenderedCellForEvent(event.touchEvent)!;

            this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
        };

        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());

    }

    private getRowForEvent(event: Event): RowController | null {
        let sourceElement: Element | null = getTarget(event);

        while (sourceElement) {
            const rowCon = this.gridOptionsWrapper.getDomData(sourceElement, RowController.DOM_DATA_KEY_RENDERED_ROW);
            if (rowCon) {
                return rowCon;
            }

            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    private handleContextMenuMouseEvent(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowComp: RowController | null, cellComp: CellComp) {
        const rowNode = rowComp ? rowComp.getRowNode() : null;
        const column = cellComp ? cellComp.getColumn() : null;
        let value = null;

        if (column) {
            const event = mouseEvent ? mouseEvent : touchEvent;
            cellComp.dispatchCellContextMenuEvent(event);
            value = this.valueService.getValue(column, rowNode);
        }

        // if user clicked on a cell, anchor to that cell, otherwise anchor to the grid panel
        const anchorToElement = cellComp ? cellComp.getGui() : this.gridBodyCon.getGridBodyElement();

        if (this.contextMenuFactory) {
            this.contextMenuFactory.onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement);
        }
    }
}