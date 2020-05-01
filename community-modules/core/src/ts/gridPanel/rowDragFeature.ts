import {
    DragAndDropService, DraggingEvent, DragSourceType, DropTarget,
    VerticalDirection
} from "../dragAndDrop/dragAndDropService";
import { Autowired, Optional, PostConstruct, PreDestroy } from "../context/context";
import { ColumnController } from "../columnController/columnController";
import { FocusController } from "../focusController";
import { IRangeController } from "../interfaces/iRangeController";
import { GridPanel } from "./gridPanel";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { EventService } from "../eventService";
import { RowDragEvent, RowDragEnterEvent, RowDragLeaveEvent, RowDragMoveEvent, RowDragEndEvent } from "../events";
import { Events } from "../eventKeys";
import { IRowModel } from "../interfaces/iRowModel";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { RowNode } from "../entities/rowNode";
import { SelectionController } from "../selectionController";
import { MouseEventService } from "./mouseEventService";
import { last } from '../utils/array';
import { SortController } from "../sortController";
import { FilterManager } from "../filter/filterManager";
import { _ } from "../utils";

export interface RowDropZoneEvents {
    onDragEnter?: (params: RowDragEnterEvent) => void;
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    onDragging?: (params: RowDragMoveEvent) => void;
    onDragStop?: (params: RowDragEndEvent) => void;
}

export interface RowDropZoneParams extends RowDropZoneEvents {
    getContainer: () => HTMLElement;
    fromGrid?: boolean;
}

export class RowDragFeature implements DropTarget {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    // this feature is only created when row model is ClientSide, so we can type it as ClientSide
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('focusController') private focusController: FocusController;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('filterManager') private filterManager: FilterManager;
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
    private events: (() => void)[] = [];
    private isGridSorted: boolean = false;
    private isGridFiltered: boolean = false;
    private isRowGroupActive: boolean = false;

    constructor(eContainer: HTMLElement, gridPanel: GridPanel) {
        this.eContainer = eContainer;
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }

        this.events.push(
            this.eventService.addEventListener(Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this)),
            this.eventService.addEventListener(Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this)),
            this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this))
        );

        this.onSortChanged();
        this.onFilterChanged();
        this.onRowGroupChanged();
    }

    @PreDestroy
    public destroy(): void {
        if (this.events.length) {
            this.events.forEach(func => func());
        }
    }

    private onSortChanged(): void {
        const sortModel = this.sortController.getSortModel();
        this.isGridSorted = !_.missingOrEmpty(sortModel);
    }

    private onFilterChanged(): void {
        this.isGridFiltered = this.filterManager.isAnyFilterPresent();
    }

    private onRowGroupChanged(): void {
        const rowGroups = this.columnController.getRowGroupColumns();
        this.isRowGroupActive = !_.missingOrEmpty(rowGroups);
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(): string {
        const managedDrag = this.gridOptionsWrapper.isRowDragManaged();

        if (managedDrag && this.shouldPreventRowMove()) {
            return DragAndDropService.ICON_NOT_ALLOWED;
        }

        return DragAndDropService.ICON_MOVE;
    }

    public shouldPreventRowMove(): boolean {
        return this.isGridSorted || this.isGridFiltered || this.isRowGroupActive;
    }

    private getRowNodes(draggingEvent: DraggingEvent): RowNode[] {
        if (!this.isFromThisGrid(draggingEvent)) {
            return draggingEvent.dragItem.rowNodes;
        }

        const enableMultiRowDragging = this.gridOptionsWrapper.isEnableMultiRowDragging();
        const selectedNodes = this.selectionController.getSelectedNodes();
        const currentNode = draggingEvent.dragItem.rowNode;

        if (enableMultiRowDragging && selectedNodes.indexOf(currentNode) !== -1) {
            this.isMultiRowDrag = true;
            return [...selectedNodes];
        }

        this.isMultiRowDrag = false;

        return [currentNode];
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchEvent(Events.EVENT_ROW_DRAG_ENTER, draggingEvent);

        this.getRowNodes(draggingEvent).forEach(rowNode => {
            rowNode.setDragging(true);
        });

        this.onEnterOrDragging(draggingEvent);
    }

    public onDragging(draggingEvent: DraggingEvent): void {
        this.onEnterOrDragging(draggingEvent);
    }

    private isFromThisGrid(draggingEvent: DraggingEvent) {
        return this.gridPanel.getGui().contains(draggingEvent.dragSource.eElement);
    }

    private isDropZoneWithinThisGrid(draggingEvent: DraggingEvent): boolean {
        const gridGui = this.gridPanel.getGui();
        const { dropZoneTarget } = draggingEvent;

        return !gridGui.contains(dropZoneTarget);
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
        let rowNodes: RowNode[];
        const isFromThisGrid = this.isFromThisGrid(draggingEvent);

        if (isFromThisGrid) {
            rowNodes = [draggingEvent.dragItem.rowNode];

            if (this.isMultiRowDrag) {
                rowNodes = [...this.selectionController.getSelectedNodes()].sort(
                    (a, b) => this.getRowIndexNumber(a) - this.getRowIndexNumber(b)
                );
            }

            draggingEvent.dragItem.rowNodes = rowNodes;
        } else {
            rowNodes = draggingEvent.dragItem.rowNodes;
        }

        const managedDrag = this.gridOptionsWrapper.isRowDragManaged();

        if (managedDrag && this.shouldPreventRowMove()) {
            return;
        }

        if (this.gridOptionsWrapper.isSuppressMoveWhenRowDragging() || !isFromThisGrid) {
            if (!this.isDropZoneWithinThisGrid(draggingEvent)) {
                this.clientSideRowModel.highlightRowAtPixel(rowNodes[0], pixel);
            }
        } else {
            this.moveRows(rowNodes, pixel);
        }
    }

    private getRowIndexNumber(rowNode: RowNode): number {
        return parseInt(last(rowNode.getRowIndexString().split('-')), 10);
    }

    private moveRowAndClearHighlight(draggingEvent: DraggingEvent): void {
        const lastHighlightedRowNode = this.clientSideRowModel.getLastHighlightedRowNode();
        const isBelow = lastHighlightedRowNode && lastHighlightedRowNode.highlighted === 'below';
        const pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const rowNodes = draggingEvent.dragItem.rowNodes;

        let increment = isBelow ? 1 : 0;

        if (this.isFromThisGrid(draggingEvent)) {
            rowNodes.forEach(rowNode => {
                if (rowNode.rowTop < pixel) {
                    increment -= 1;
                }
            });
            this.moveRows(rowNodes, pixel, increment);
        } else {
            const getRowNodeId = this.gridOptionsWrapper.getRowNodeIdFunc();

            let addIndex = this.clientSideRowModel.getRowIndexAtPixel(pixel) + 1;

            if (this.clientSideRowModel.getHighlightPosition(pixel) === 'above') {
                addIndex--;
            }

            this.clientSideRowModel.updateRowData({
                add: rowNodes
                    .map(node => node.data)
                    .filter(data => !this.clientSideRowModel.getRowNode(
                        getRowNodeId ? getRowNodeId(data) : data.id)
                    ),
                addIndex
            });
        }

        this.clearRowHighlight();
    }

    private clearRowHighlight(): void {
        this.clientSideRowModel.highlightRowAtPixel(null);
    }

    private moveRows(rowNodes: RowNode[], pixel: number, increment: number = 0): void {
        const rowWasMoved = this.clientSideRowModel.ensureRowsAtPixel(rowNodes, pixel, increment);

        if (rowWasMoved) {
            this.focusController.clearFocusedCell();
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
        if (this.movingIntervalId) { return; }

        this.intervalCount = 0;
        this.movingIntervalId = window.setInterval(this.moveInterval.bind(this), 100);

    }

    private ensureIntervalCleared(): void {
        if (!this.moveInterval) { return; }

        window.clearInterval(this.movingIntervalId);
        this.movingIntervalId = null;
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

    public addRowDropZone(params: RowDropZoneParams): void {
        if (!params.getContainer()) {
            _.doOnce(() => console.warn('ag-Grid: addRowDropZone - A container target needs to be provided'), 'add-drop-zone-empty-target');
            return;
        }

        if (this.dragAndDropService.findExternalZone(params)) {
            console.warn('ag-Grid: addRowDropZone - target already exists in the list of DropZones. Use `removeRowDropZone` before adding it again.');
            return;
        }

        let processedParams: RowDropZoneParams = {
            getContainer: params.getContainer
        };

        if (params.fromGrid) {
            params.fromGrid = undefined;
            processedParams = params;
        } else {
            if (params.onDragEnter) {
                processedParams.onDragEnter = (e) => {
                    params.onDragEnter(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_ENTER, e as any));
                };
            }
            if (params.onDragLeave) {
                processedParams.onDragLeave = (e) => {
                    params.onDragLeave(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_LEAVE, e as any));
                };
            }
            if (params.onDragging) {
                processedParams.onDragging = (e) => {
                    params.onDragging(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_MOVE, e as any));
                };
            }
            if (params.onDragStop) {
                processedParams.onDragStop = (e) => {
                    params.onDragStop(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_END, e as any));
                };
            }
        }

        this.dragAndDropService.addDropTarget({
            isInterestedIn: (type: DragSourceType) => type === DragSourceType.RowDrag,
            getIconName:() => DragAndDropService.ICON_MOVE,
            external: true,
            ...processedParams as any
        });
    }

    public getRowDropZone(events: RowDropZoneEvents): RowDropZoneParams {
        const getContainer = this.getContainer.bind(this);
        const onDragEnter = this.onDragEnter.bind(this);
        const onDragLeave = this.onDragLeave.bind(this);
        const onDragging = this.onDragging.bind(this);
        const onDragStop = this.onDragStop.bind(this);

        if (!events) {
            return { getContainer, onDragEnter, onDragLeave, onDragging, onDragStop, fromGrid: true };
        }

        return {
            getContainer,
            onDragEnter: events.onDragEnter
                ? ((e) => {
                    onDragEnter(e);
                    events.onDragEnter(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_ENTER, e as any));
                })
                : onDragEnter,
            onDragLeave: events.onDragLeave
                ? ((e) => {
                    onDragLeave(e);
                    events.onDragLeave(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_LEAVE, e as any));
                })
                : onDragLeave,
            onDragging: events.onDragging
                ? ((e) => {
                    onDragging(e);
                    events.onDragging(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_MOVE, e as any));
                })
                : onDragging,
            onDragStop: events.onDragStop
                ? ((e) => {
                    onDragStop(e);
                    events.onDragStop(this.draggingToRowDragEvent(Events.EVENT_ROW_DRAG_END, e as any));
                })
                : onDragStop,
            fromGrid: true
        };
    }

    private draggingToRowDragEvent(type: string, draggingEvent: DraggingEvent): RowDragEvent {
        const yNormalised = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const mouseIsPastLastRow = yNormalised > this.rowModel.getCurrentPageHeight();

        let overIndex = -1;
        let overNode = null;

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
            nodes: draggingEvent.dragItem.rowNodes,
            overIndex: overIndex,
            overNode: overNode,
            y: yNormalised,
            vDirection: vDirectionString
        };

        return event;
    }

    public dispatchEvent(type: string, draggingEvent: DraggingEvent): void {
        const event = this.draggingToRowDragEvent(type, draggingEvent);

        this.eventService.dispatchEvent(event);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.dispatchEvent(Events.EVENT_ROW_DRAG_LEAVE, draggingEvent);
        this.stopDragging(draggingEvent);
        this.clearRowHighlight();

        if (this.isFromThisGrid(draggingEvent)) {
            this.isMultiRowDrag = false;
        }
    }

    public onDragStop(draggingEvent: DraggingEvent): void {
        this.dispatchEvent(Events.EVENT_ROW_DRAG_END, draggingEvent);
        this.stopDragging(draggingEvent);

        if (
            this.gridOptionsWrapper.isRowDragManaged() &&
            (this.gridOptionsWrapper.isSuppressMoveWhenRowDragging() || !this.isFromThisGrid(draggingEvent)) &&
            !this.isDropZoneWithinThisGrid(draggingEvent)
        ) {
            this.moveRowAndClearHighlight(draggingEvent);
        }
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        this.ensureIntervalCleared();

        this.getRowNodes(draggingEvent).forEach(rowNode => {
            rowNode.setDragging(false);
        });
    }
}