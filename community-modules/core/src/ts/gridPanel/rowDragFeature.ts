import {
    DragAndDropService, DraggingEvent, DragSourceType, DropTarget,
    VerticalDirection
} from "../dragAndDrop/dragAndDropService";
import { Autowired, Optional, PostConstruct } from "../context/context";
import { FocusedCellController } from "../focusedCellController";
import { IRangeController } from "../interfaces/iRangeController";
import { GridPanel } from "./gridPanel";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { EventService } from "../eventService";
import { RowDragEvent } from "../events";
import { Events } from "../eventKeys";
import { IRowModel } from "../interfaces/iRowModel";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { RowNode } from "../entities/rowNode";
import { SelectionController } from "../selectionController";
import { MouseEventService } from "./mouseEventService";
import { _ } from "../utils/general";

export class RowDragFeature implements DropTarget {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    // this feature is only created when row model is ClientSide, so we can type it as ClientSide
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('eventService') private eventService: EventService;

    private gridPanel: GridPanel;
    private clientSideRowModel: IClientSideRowModel;
    private eContainer: HTMLElement;
    private needToMoveUp: boolean;
    private needToMoveDown: boolean;
    private movingIntervalId: number;
    private intervalCount: number;
    private lastDraggingEvent: DraggingEvent;
    private isMultiRowDrag: boolean = false;
    private movingNodes: RowNode[] = null;

    constructor(eContainer: HTMLElement, gridPanel: GridPanel) {
        this.eContainer = eContainer;
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(): string {
        return DragAndDropService.ICON_MOVE;
    }

    public getRowNodes(dragginEvent: DraggingEvent): RowNode[] {
        const enableMultiRowDragging = this.gridOptionsWrapper.isEnableMultiRowDragging();
        const selectedNodes = this.selectionController.getSelectedNodes();
        const currentNode = dragginEvent.dragItem.rowNode;

        if (enableMultiRowDragging && selectedNodes.indexOf(currentNode) !== -1) {
            this.isMultiRowDrag = true;
            return [...selectedNodes];
        }

        return [currentNode];
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchEvent(Events.EVENT_ROW_DRAG_ENTER, draggingEvent);
        this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_MOVE);

        this.getRowNodes(draggingEvent).forEach((rowNode, idx) => {
            rowNode.setDragging(true);
        });

        this.onEnterOrDragging(draggingEvent);
    }

    public onDragging(draggingEvent: DraggingEvent): void {
        this.onEnterOrDragging(draggingEvent);
    }

    private onEnterOrDragging(draggingEvent: DraggingEvent): void {
        // this event is fired for enter and move
        this.dispatchEvent(Events.EVENT_ROW_DRAG_MOVE, draggingEvent);

        this.lastDraggingEvent = draggingEvent;
        const pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;

        const managedDrag = this.gridOptionsWrapper.isRowDragManaged();
        if (managedDrag) {
            this.doManagedDrag(draggingEvent, pixel);
        }

        this.checkCenterForScrolling(pixel);
    }

    private doManagedDrag(draggingEvent: DraggingEvent, pixel: number): void {
        let rowNodes = this.movingNodes = [draggingEvent.dragItem.rowNode];

        if (this.isMultiRowDrag) {
            rowNodes = this.movingNodes = [...this.selectionController.getSelectedNodes()].sort(
                (a, b) => this.getRowIndexNumber(a) - this.getRowIndexNumber(b)
            );
        }

        if (this.gridOptionsWrapper.isSuppressMoveWhenRowDragging()) {
            this.clientSideRowModel.highlightRowAtPixel(rowNodes[0], pixel);
        } else {
            this.moveRows(rowNodes, pixel);
        }
    }

    private getRowIndexNumber(rowNode: RowNode): number {
        return parseInt(_.last(rowNode.getRowIndexString().split('-')), 10);
    }

    private moveRowAndClearHighlight(draggingEvent: DraggingEvent): void {
        const lastHighlightedRowNode = this.clientSideRowModel.getLastHighlightedRowNode();
        const isBelow = lastHighlightedRowNode && lastHighlightedRowNode.highlighted === 'below';
        const pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const rowNodes = this.movingNodes;
        let increment = isBelow ? 1 : 0;

        rowNodes.forEach(rowNode => {
            if (rowNode.rowTop < pixel) {
                increment -= 1;
            }
        });

        this.moveRows(rowNodes, pixel, increment);
        this.clearRowHighlight();
    }

    private clearRowHighlight(): void {
        this.clientSideRowModel.highlightRowAtPixel(null);
    }

    private moveRows(rowNodes: RowNode[], pixel: number, increment: number = 0): void {
        const rowWasMoved = this.clientSideRowModel.ensureRowsAtPixel(rowNodes, pixel, increment);

        if (rowWasMoved) {
            this.focusedCellController.clearFocusedCell();
            if (this.rangeController) {
                this.rangeController.removeAllCellRanges();
            }
        }
    }

    private checkCenterForScrolling(pixel: number): void {

        // scroll if the mouse is within 50px of the grid edge
        const pixelRange = this.gridPanel.getVScrollPosition();

        // console.log(`pixelRange = (${pixelRange.top}, ${pixelRange.bottom})`);

        this.needToMoveUp = pixel < (pixelRange.top + 50);
        this.needToMoveDown = pixel > (pixelRange.bottom - 50);

        // console.log(`needToMoveUp = ${this.needToMoveUp} = pixel < (pixelRange.top + 50) = ${pixel} < (${pixelRange.top} + 50)`);
        // console.log(`needToMoveDown = ${this.needToMoveDown} = pixel < (pixelRange.top + 50) = ${pixel} < (${pixelRange.top} + 50)`);

        if (this.needToMoveUp || this.needToMoveDown) {
            this.ensureIntervalStarted();
        } else {
            this.ensureIntervalCleared();
        }
    }

    private ensureIntervalStarted(): void {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.movingIntervalId = window.setInterval(this.moveInterval.bind(this), 100);
        }
    }

    private ensureIntervalCleared(): void {
        if (this.moveInterval) {
            window.clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
        }
    }

    private moveInterval(): void {
        // the amounts we move get bigger at each interval, so the speed accelerates, starting a bit slow
        // and getting faster. this is to give smoother user experience. we max at 100px to limit the speed.
        let pixelsToMove: number;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }

        let pixelsMoved: number;
        if (this.needToMoveDown) {
            pixelsMoved = this.gridPanel.scrollVertically(pixelsToMove);
        } else if (this.needToMoveUp) {
            pixelsMoved = this.gridPanel.scrollVertically(-pixelsToMove);
        }

        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
        }
    }

    // i tried using generics here with this:
    //     public createEvent<T extends RowDragEvent>(type: string, clazz: {new(): T; }, draggingEvent: DraggingEvent) {
    // but it didn't work - i think it's because it only works with classes, and not interfaces, (the events are interfaces)
    public dispatchEvent(type: string, draggingEvent: DraggingEvent): void {
        const yNormalised = this.mouseEventService.getNormalisedPosition(draggingEvent).y;

        let overIndex = -1;
        let overNode = null;
        const mouseIsPastLastRow = yNormalised > this.rowModel.getCurrentPageHeight();

        if (!mouseIsPastLastRow) {
            overIndex = this.rowModel.getRowIndexAtPixel(yNormalised);
            overNode = this.rowModel.getRow(overIndex);
        }

        let vDirectionString: string;
        switch (draggingEvent.vDirection) {
            case VerticalDirection.Down:
                vDirectionString = 'down';
                break;
            case VerticalDirection.Up:
                vDirectionString = 'up';
                break;
            default:
                vDirectionString = null;
                break;
        }

        const event: RowDragEvent = {
            type: type,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode,
            overIndex: overIndex,
            overNode: overNode,
            y: yNormalised,
            vDirection: vDirectionString
        };

        this.eventService.dispatchEvent(event);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.dispatchEvent(Events.EVENT_ROW_DRAG_LEAVE, draggingEvent);
        this.stopDragging(draggingEvent);
        this.clearRowHighlight();
    }

    public onDragStop(draggingEvent: DraggingEvent): void {
        this.dispatchEvent(Events.EVENT_ROW_DRAG_END, draggingEvent);
        this.stopDragging(draggingEvent);

        if (
            this.gridOptionsWrapper.isRowDragManaged() &&
            this.gridOptionsWrapper.isSuppressMoveWhenRowDragging()
        ) {
            this.moveRowAndClearHighlight(draggingEvent);
        }

        this.isMultiRowDrag = false;
        this.movingNodes = null;
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        this.ensureIntervalCleared();
        this.getRowNodes(draggingEvent).forEach((rowNode, idx) => {
            rowNode.setDragging(false);
        });
    }
}