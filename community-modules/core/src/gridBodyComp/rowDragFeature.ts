import { AutoScrollService } from '../autoScrollService';
import type { FuncColsService } from '../columns/funcColsService';
import { VerticalDirection } from '../constants/direction';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { DragAndDropIcon, DragAndDropService, DraggingEvent, DropTarget } from '../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../dragAndDrop/dragAndDropService';
import type { RowNode } from '../entities/rowNode';
import type { AgEventType } from '../eventTypes';
import type { RowDragEndEvent, RowDragEnterEvent, RowDragEvent, RowDragLeaveEvent, RowDragMoveEvent } from '../events';
import type { FilterManager } from '../filter/filterManager';
import type { FocusService } from '../focusService';
import type { IRangeService } from '../interfaces/IRangeService';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import { RowHighlightPosition } from '../interfaces/iRowNode';
import type { ISelectionService } from '../interfaces/iSelectionService';
import type { PageBoundsService } from '../pagination/pageBoundsService';
import type { SortController } from '../sortController';
import { _last } from '../utils/array';
import { _warnOnce } from '../utils/function';
import type { MouseEventService } from './mouseEventService';

export interface RowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: RowDragEnterEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: RowDragMoveEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: RowDragEndEvent) => void;
}

export interface RowDropZoneParams extends RowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
}

export class RowDragFeature extends BeanStub implements DropTarget {
    private dragAndDropService: DragAndDropService;
    private rowModel: IRowModel;
    private pageBoundsService: PageBoundsService;
    private focusService: FocusService;
    private sortController: SortController;
    private filterManager?: FilterManager;
    private selectionService: ISelectionService;
    private mouseEventService: MouseEventService;
    private ctrlsService: CtrlsService;
    private funcColsService: FuncColsService;
    private rangeService?: IRangeService;

    public wireBeans(beans: BeanCollection): void {
        this.dragAndDropService = beans.dragAndDropService;
        this.rowModel = beans.rowModel;
        this.pageBoundsService = beans.pageBoundsService;
        this.focusService = beans.focusService;
        this.sortController = beans.sortController;
        this.filterManager = beans.filterManager;
        this.selectionService = beans.selectionService;
        this.mouseEventService = beans.mouseEventService;
        this.ctrlsService = beans.ctrlsService;
        this.funcColsService = beans.funcColsService;
        this.rangeService = beans.rangeService;
    }

    private clientSideRowModel: IClientSideRowModel;
    private eContainer: HTMLElement;
    private lastDraggingEvent: DraggingEvent;
    private autoScrollService: AutoScrollService;

    constructor(eContainer: HTMLElement) {
        super();
        this.eContainer = eContainer;
    }

    public postConstruct(): void {
        if (this.gos.isRowModelType('clientSide')) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }

        this.ctrlsService.whenReady((p) => {
            const gridBodyCon = p.gridBodyCtrl;
            this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCon.getBodyViewportElement(),
                scrollAxis: 'y',
                getVerticalPosition: () => gridBodyCon.getScrollFeature().getVScrollPosition().top,
                setVerticalPosition: (position) => gridBodyCon.getScrollFeature().setVerticalScrollPosition(position),
                onScrollCallback: () => {
                    this.onDragging(this.lastDraggingEvent);
                },
            });
        });
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(): DragAndDropIcon {
        const managedDrag = this.gos.get('rowDragManaged');

        if (managedDrag && this.shouldPreventRowMove()) {
            return 'notAllowed';
        }

        return 'move';
    }

    public shouldPreventRowMove(): boolean {
        const rowGroupCols = this.funcColsService.getRowGroupColumns();
        if (rowGroupCols.length) {
            return true;
        }
        const isFilterPresent = this.filterManager?.isAnyFilterPresent();
        if (isFilterPresent) {
            return true;
        }
        const isSortActive = this.sortController.isSortActive();
        if (isSortActive) {
            return true;
        }
        return false;
    }

    private getRowNodes(draggingEvent: DraggingEvent): RowNode[] {
        if (!this.isFromThisGrid(draggingEvent)) {
            return (draggingEvent.dragItem.rowNodes || []) as RowNode[];
        }

        const currentNode = draggingEvent.dragItem.rowNode! as RowNode;
        const isRowDragMultiRow = this.gos.get('rowDragMultiRow');
        if (isRowDragMultiRow) {
            const selectedNodes = [...this.selectionService.getSelectedNodes()].sort((a, b) => {
                if (a.rowIndex == null || b.rowIndex == null) {
                    return 0;
                }

                return this.getRowIndexNumber(a) - this.getRowIndexNumber(b);
            });
            if (selectedNodes.indexOf(currentNode) !== -1) {
                return selectedNodes;
            }
        }

        return [currentNode];
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // builds a lits of all rows being dragged before firing events
        draggingEvent.dragItem.rowNodes = this.getRowNodes(draggingEvent);

        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchGridEvent('rowDragEnter', draggingEvent);

        this.getRowNodes(draggingEvent).forEach((rowNode) => {
            rowNode.setDragging(true);
        });

        this.onEnterOrDragging(draggingEvent);
    }

    public onDragging(draggingEvent: DraggingEvent): void {
        this.onEnterOrDragging(draggingEvent);
    }

    private isFromThisGrid(draggingEvent: DraggingEvent) {
        const { dragSourceDomDataKey } = draggingEvent.dragSource;

        return dragSourceDomDataKey === this.gos.getDomDataKey();
    }

    private isDropZoneWithinThisGrid(draggingEvent: DraggingEvent): boolean {
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const gridGui = gridBodyCon.getGui();
        const { dropZoneTarget } = draggingEvent;

        return !gridGui.contains(dropZoneTarget);
    }

    private onEnterOrDragging(draggingEvent: DraggingEvent): void {
        // this event is fired for enter and move
        this.dispatchGridEvent('rowDragMove', draggingEvent);

        this.lastDraggingEvent = draggingEvent;

        const pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const managedDrag = this.gos.get('rowDragManaged');

        if (managedDrag) {
            this.doManagedDrag(draggingEvent, pixel);
        }

        this.autoScrollService.check(draggingEvent.event);
    }

    private doManagedDrag(draggingEvent: DraggingEvent, pixel: number): void {
        const isFromThisGrid = this.isFromThisGrid(draggingEvent);
        const managedDrag = this.gos.get('rowDragManaged');
        const rowNodes = draggingEvent.dragItem.rowNodes! as RowNode[];

        if (managedDrag && this.shouldPreventRowMove()) {
            return;
        }

        if (this.gos.get('suppressMoveWhenRowDragging') || !isFromThisGrid) {
            if (!this.isDropZoneWithinThisGrid(draggingEvent)) {
                this.clientSideRowModel.highlightRowAtPixel(rowNodes[0], pixel);
            }
        } else {
            this.moveRows(rowNodes, pixel);
        }
    }

    private getRowIndexNumber(rowNode: RowNode): number {
        const rowIndexStr = rowNode.getRowIndexString()!;

        return parseInt(_last(rowIndexStr.split('-')), 10);
    }

    private moveRowAndClearHighlight(draggingEvent: DraggingEvent): void {
        const lastHighlightedRowNode = this.clientSideRowModel.getLastHighlightedRowNode();
        const isBelow = lastHighlightedRowNode && lastHighlightedRowNode.highlighted === RowHighlightPosition.Below;
        const pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const rowNodes = draggingEvent.dragItem.rowNodes as RowNode[];

        let increment = isBelow ? 1 : 0;

        if (this.isFromThisGrid(draggingEvent)) {
            rowNodes!.forEach((rowNode) => {
                if (rowNode.rowTop! < pixel) {
                    increment -= 1;
                }
            });
            this.moveRows(rowNodes!, pixel, increment);
        } else {
            const getRowIdFunc = this.gos.getRowIdCallback();

            let addIndex = this.clientSideRowModel.getRowIndexAtPixel(pixel) + 1;

            if (this.clientSideRowModel.getHighlightPosition(pixel) === RowHighlightPosition.Above) {
                addIndex--;
            }

            this.clientSideRowModel.updateRowData({
                add: rowNodes!.filter(
                    (node) =>
                        !this.clientSideRowModel.getRowNode(
                            getRowIdFunc?.({ data: node.data, level: 0, rowPinned: node.rowPinned }) ?? node.data.id
                        )
                ),
                addIndex,
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
            this.focusService.clearFocusedCell();
            this.rangeService?.removeAllCellRanges();
        }
    }

    public addRowDropZone(params: RowDropZoneParams & { fromGrid?: boolean }): void {
        if (!params.getContainer()) {
            _warnOnce('addRowDropZone - A container target needs to be provided');
            return;
        }

        if (this.dragAndDropService.findExternalZone(params)) {
            _warnOnce(
                'addRowDropZone - target already exists in the list of DropZones. Use `removeRowDropZone` before adding it again.'
            );
            return;
        }

        let processedParams: RowDropZoneParams = {
            getContainer: params.getContainer,
        };

        if (params.fromGrid) {
            processedParams = params;
        } else {
            if (params.onDragEnter) {
                processedParams.onDragEnter = (e) => {
                    params.onDragEnter!(this.draggingToRowDragEvent('rowDragEnter', e as any));
                };
            }
            if (params.onDragLeave) {
                processedParams.onDragLeave = (e) => {
                    params.onDragLeave!(this.draggingToRowDragEvent('rowDragLeave', e as any));
                };
            }
            if (params.onDragging) {
                processedParams.onDragging = (e) => {
                    params.onDragging!(this.draggingToRowDragEvent('rowDragMove', e as any));
                };
            }
            if (params.onDragStop) {
                processedParams.onDragStop = (e) => {
                    params.onDragStop!(this.draggingToRowDragEvent('rowDragEnd', e as any));
                };
            }
        }

        this.dragAndDropService.addDropTarget({
            isInterestedIn: (type: DragSourceType) => type === DragSourceType.RowDrag,
            getIconName: () => 'move',
            external: true,
            ...(processedParams as any),
        });
    }

    public getRowDropZone(events?: RowDropZoneEvents): RowDropZoneParams {
        const getContainer = this.getContainer.bind(this);
        const onDragEnter = this.onDragEnter.bind(this);
        const onDragLeave = this.onDragLeave.bind(this);
        const onDragging = this.onDragging.bind(this);
        const onDragStop = this.onDragStop.bind(this);

        if (!events) {
            return {
                getContainer,
                onDragEnter,
                onDragLeave,
                onDragging,
                onDragStop,
                /* @private */ fromGrid: true,
            } as RowDropZoneParams;
        }

        return {
            getContainer,
            onDragEnter: events.onDragEnter
                ? (e) => {
                      onDragEnter(e);
                      events.onDragEnter!(this.draggingToRowDragEvent('rowDragEnter', e as any));
                  }
                : onDragEnter,
            onDragLeave: events.onDragLeave
                ? (e) => {
                      onDragLeave(e);
                      events.onDragLeave!(this.draggingToRowDragEvent('rowDragLeave', e as any));
                  }
                : onDragLeave,
            onDragging: events.onDragging
                ? (e) => {
                      onDragging(e);
                      events.onDragging!(this.draggingToRowDragEvent('rowDragMove', e as any));
                  }
                : onDragging,
            onDragStop: events.onDragStop
                ? (e) => {
                      onDragStop(e);
                      events.onDragStop!(this.draggingToRowDragEvent('rowDragEnd', e as any));
                  }
                : onDragStop,
            fromGrid: true /* @private */,
        } as RowDropZoneParams;
    }

    private draggingToRowDragEvent<T extends AgEventType>(type: T, draggingEvent: DraggingEvent): RowDragEvent<T> {
        const yNormalised = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        const mouseIsPastLastRow = yNormalised > this.pageBoundsService.getCurrentPageHeight();

        let overIndex = -1;
        let overNode: RowNode | undefined;

        if (!mouseIsPastLastRow) {
            overIndex = this.rowModel.getRowIndexAtPixel(yNormalised);
            overNode = this.rowModel.getRow(overIndex);
        }

        let vDirectionString: string | null;

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

        const event: RowDragEvent<T> = this.gos.addGridCommonParams({
            type: type,
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode!,
            nodes: draggingEvent.dragItem.rowNodes!,
            overIndex: overIndex,
            overNode: overNode,
            y: yNormalised,
            vDirection: vDirectionString!,
        });

        return event;
    }

    private dispatchGridEvent<T extends AgEventType>(type: T, draggingEvent: DraggingEvent): void {
        const event = this.draggingToRowDragEvent(type, draggingEvent);

        this.eventService.dispatchEvent(event);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragLeave', draggingEvent);
        this.stopDragging(draggingEvent);

        if (this.gos.get('rowDragManaged')) {
            this.clearRowHighlight();
        }
    }

    public onDragStop(draggingEvent: DraggingEvent): void {
        this.dispatchGridEvent('rowDragEnd', draggingEvent);
        this.stopDragging(draggingEvent);

        if (
            this.gos.get('rowDragManaged') &&
            (this.gos.get('suppressMoveWhenRowDragging') || !this.isFromThisGrid(draggingEvent)) &&
            !this.isDropZoneWithinThisGrid(draggingEvent)
        ) {
            this.moveRowAndClearHighlight(draggingEvent);
        }
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        this.autoScrollService.ensureCleared();

        this.getRowNodes(draggingEvent).forEach((rowNode) => {
            rowNode.setDragging(false);
        });
    }
}
