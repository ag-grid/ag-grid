import { AutoScrollService } from '../agStack/rendering/autoScrollService';
import { _areEqual } from '../agStack/utils/array';
import { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import { _csrmFirstLeaf, _csrmReorderAllLeafs } from '../clientSideRowModel/clientSideRowModelUtils';
import { BeanStub } from '../context/beanStub';
import { _getCellByPosition } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import { _prevOrNextDisplayedRow } from '../entities/rowNodeUtils';
import type { RowDragEvent, RowDragEventType } from '../events';
import { _getNormalisedMousePosition } from '../gridBodyComp/mouseEventUtils';
import { _getRowIdCallback, _isClientSideRowModel } from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import { ChangedPath } from '../utils/changedPath';
import { _warn } from '../validation/logging';
import type { DragAndDropIcon, DropTarget } from './dragAndDropService';
import { DragSourceType } from './dragAndDropService';
import type {
    RowDraggingEvent,
    RowDropTargetPosition,
    RowDropZoneEvents,
    RowDropZoneParams,
    RowsDrop,
} from './rowDragTypes';

const POINTER_INSIDE_THRESHOLD = 0.25;

/** We actually have a different interface if we are passing params out of the grid and
 * directly into another grid. These internal params just work directly off the DraggingEvent.
 * However, we don't want to expose these to the user, so we have a different interface for
 * them called RowDropZoneParams which works with RowDragEvents.
 */
interface InternalRowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: RowDraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: RowDraggingEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: RowDraggingEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: RowDraggingEvent) => void;
    onDragCancel?: (params: RowDraggingEvent) => void;
}
interface InternalRowDropZoneParams extends InternalRowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
    /** internal flag for identifying params from the grid. */
    fromGrid?: boolean;
}

type RowsDropCustomResult = {
    rows?: IRowNode[] | null;
    newParent?: IRowNode | null;
    target?: IRowNode | null;
    position?: RowDropTargetPosition;
    allowed?: boolean;
    changed?: boolean;
    highlight?: boolean;
};

export class RowDragFeature extends BeanStub implements DropTarget {
    public lastDraggingEvent: RowDraggingEvent | null = null;
    private autoScroll: AutoScrollService | null = null;
    private autoScrollChanged = false;
    private autoScrollChanging = false;
    private autoScrollOldV: number | null = null;

    constructor(private eContainer: HTMLElement | null) {
        super();
    }

    public postConstruct(): void {
        const beans = this.beans;

        beans.ctrlsSvc.whenReady(this, (p) => {
            const getScrollY = () => p.gridBodyCtrl.scrollFeature.getVScrollPosition().top;
            const autoScroll = new AutoScrollService({
                scrollContainer: p.gridBodyCtrl.eBodyViewport,
                scrollAxis: 'y',
                getVerticalPosition: getScrollY,
                setVerticalPosition: (position: number) =>
                    p.gridBodyCtrl.scrollFeature.setVerticalScrollPosition(position),
                onScrollCallback: () => {
                    const newVScroll = getScrollY();
                    if (this.autoScrollOldV !== newVScroll) {
                        this.autoScrollOldV = newVScroll;
                        this.autoScrollChanging = true;
                        return;
                    }
                    const changed = this.autoScrollChanging;
                    this.autoScrollChanged = changed;
                    this.autoScrollChanging = false;
                    if (changed) {
                        beans.dragAndDrop?.nudge();
                        this.autoScrollChanged = false;
                    }
                },
            });
            this.autoScroll = autoScroll;
            this.clearAutoScroll();
        });
    }

    public override destroy(): void {
        super.destroy();
        this.clearAutoScroll();
        this.autoScroll = null;
        this.lastDraggingEvent = null;
        this.eContainer = null;
    }

    public getContainer(): HTMLElement {
        return this.eContainer!;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(draggingEvent: RowDraggingEvent | null): DragAndDropIcon {
        if (draggingEvent?.dropTarget?.allowed === false) {
            return 'notAllowed';
        }

        if (this.gos.get('rowDragManaged') && this.shouldPreventRowMove()) {
            return 'notAllowed';
        }

        return 'move';
    }

    public shouldPreventRowMove(): boolean {
        const { gos, rowGroupColsSvc, filterManager, sortSvc } = this.beans;
        if (rowGroupColsSvc?.columns?.length && !gos.get('refreshAfterGroupEdit')) {
            return true;
        }
        const isFilterPresent = filterManager?.isAnyFilterPresent();
        if (isFilterPresent) {
            return true;
        }
        const isSortActive = sortSvc?.isSortActive();
        if (isSortActive) {
            return true;
        }
        return false;
    }

    private getRowNodes(draggingEvent: RowDraggingEvent): RowNode[] {
        if (!this.isFromThisGrid(draggingEvent)) {
            return (draggingEvent.dragItem.rowNodes || []) as RowNode[];
        }
        const currentNode = draggingEvent.dragItem.rowNode! as RowNode;
        if (this.gos.get('rowDragMultiRow')) {
            const selectedNodes = this.beans.selectionSvc?.getSelectedNodes();
            if (selectedNodes && selectedNodes.indexOf(currentNode) >= 0) {
                return selectedNodes.slice().sort(compareRowIndex);
            }
        }
        return [currentNode];
    }

    public onDragEnter(draggingEvent: RowDraggingEvent): void {
        this.dragging(draggingEvent, true);
    }

    public onDragging(draggingEvent: RowDraggingEvent): void {
        this.dragging(draggingEvent, false);
    }

    private dragging(draggingEvent: RowDraggingEvent, enter: boolean): void {
        const { lastDraggingEvent, beans } = this;

        if (enter) {
            const rowNodes = this.getRowNodes(draggingEvent);
            draggingEvent.dragItem.rowNodes = rowNodes;
            setRowNodesDragging(rowNodes, true);
        }

        this.lastDraggingEvent = draggingEvent;
        const fromNudge = draggingEvent.fromNudge;

        const rowsDrop = this.makeRowsDrop(lastDraggingEvent, draggingEvent, fromNudge, false);
        beans.rowDropHighlightSvc?.fromDrag(draggingEvent);

        if (enter) {
            this.dispatchGridEvent('rowDragEnter', draggingEvent); // we fire both the enter and move.
        }
        this.dispatchGridEvent('rowDragMove', draggingEvent);

        const autoScroll = this.autoScroll;
        if (
            rowsDrop?.rowDragManaged &&
            rowsDrop.moved &&
            rowsDrop.allowed &&
            rowsDrop.sameGrid &&
            !rowsDrop.suppressMoveWhenRowDragging &&
            // Avoid flickering by only dropping while auto-scrolling is not happening
            ((!fromNudge && !autoScroll?.scrolling) || this.autoScrollChanged)
        ) {
            this.dropRows(rowsDrop); // Drop the rows while dragging
        }
        autoScroll?.check(draggingEvent.event);
    }

    private isFromThisGrid(draggingEvent: RowDraggingEvent) {
        return draggingEvent.dragSource.dragSourceDomDataKey === this.gos.getDomDataKey();
    }

    private makeRowsDrop(
        lastDraggingEvent: RowDraggingEvent | null,
        draggingEvent: RowDraggingEvent,
        fromNudge: boolean,
        dropping: boolean
    ): RowsDrop | null {
        const { beans, gos } = this;
        const rowsDrop = this.newRowsDrop(draggingEvent, dropping);
        const rowModel = beans.rowModel;
        draggingEvent.dropTarget = rowsDrop;
        draggingEvent.changed = false;
        if (!rowsDrop) {
            return null;
        }

        let { sameGrid, rootNode, source, target } = rowsDrop;

        target ??= rowModel.getRow(rowModel.getRowCount() - 1) ?? null;

        const groupEditSvc = this.beans.groupEditSvc;
        const canSetParent = !!groupEditSvc?.canSetParent(rowsDrop);

        let newParent: IRowNode | null = null;
        if (target?.footer) {
            // Footer row. Get the real parent, that is the sibling of the footer
            const found = _prevOrNextDisplayedRow(rowModel, -1, target) ?? _prevOrNextDisplayedRow(rowModel, 1, target);
            if (canSetParent) {
                newParent = target.sibling ?? rootNode;
            }
            target = found ?? null;
        }
        if (target?.detail) {
            // Detail row, we chose the master row instead.
            target = target.parent;
        }
        rowsDrop.moved &&= source !== target;

        let yDelta = 0.5;
        if (target) {
            if (sameGrid && rowsDrop.moved && (newParent || !canSetParent)) {
                yDelta = source.rowIndex! > target.rowIndex! ? -0.5 : 0.5; // Flat same grid row dragging - use row index
            } else {
                yDelta = (rowsDrop.y - target.rowTop! - target.rowHeight! / 2) / target.rowHeight! || 0; // Use relative mouse position
            }
        }

        if (!canSetParent && sameGrid && target && rowsDrop.moved && _isClientSideRowModel(gos)) {
            const newTarget = deltaDraggingTarget(rowModel, rowsDrop);
            if (newTarget) {
                yDelta = source.rowIndex! > newTarget.rowIndex! ? -0.5 : 0.5;
                target = newTarget;
                rowsDrop.moved &&= source !== target;
            }
        }

        rowsDrop.target = target;
        rowsDrop.newParent = newParent;
        rowsDrop.pointerPos = computePointerPos(target, rowsDrop.y);
        rowsDrop.yDelta = yDelta;

        groupEditSvc?.fixRowsDrop(rowsDrop, canSetParent, fromNudge, yDelta);

        this.validateRowsDrop(rowsDrop, canSetParent, dropping);

        draggingEvent.changed ||= rowsDropChanged(lastDraggingEvent?.dropTarget, rowsDrop);

        return rowsDrop;
    }

    private newRowsDrop(draggingEvent: RowDraggingEvent, dropping: boolean): RowsDrop | null {
        const { beans, gos } = this;
        const rootNode = beans.rowModel.rootNode;
        const rowDragManaged = _isClientSideRowModel(gos) ? gos.get('rowDragManaged') : false;
        const suppressMoveWhenRowDragging = gos.get('suppressMoveWhenRowDragging');
        const sameGrid = this.isFromThisGrid(draggingEvent);
        let { rowNode: source, rowNodes: rows } = draggingEvent.dragItem;
        rows ||= source ? [source] : [];
        source ||= rows[0];
        if (!source || !rootNode) {
            return null;
        }

        const withinGrid = this.beans.dragAndDrop!.isDropZoneWithinThisGrid(draggingEvent);

        let allowed = true;
        if (
            rowDragManaged &&
            (!rows.length || this.shouldPreventRowMove() || ((suppressMoveWhenRowDragging || !sameGrid) && !withinGrid))
        ) {
            allowed = false;
        }

        const y = _getNormalisedMousePosition(beans, draggingEvent).y;
        const overNode = this.getOverNode(y);
        return {
            api: beans.gridApi,
            context: beans.gridOptions.context,
            draggingEvent,
            rowDragManaged,
            suppressMoveWhenRowDragging,
            sameGrid,
            withinGrid,
            treeData: false,
            rootNode,
            moved: source !== overNode,
            y,
            overNode: overNode,
            overIndex: overNode?.rowIndex ?? -1,
            pointerPos: 'none',
            position: 'none',
            source,
            target: overNode ?? null,
            newParent: null,
            rows,
            allowed,
            highlight: !dropping && rowDragManaged && suppressMoveWhenRowDragging && (withinGrid || !sameGrid),
            yDelta: 0,
            inside: false,
            droppedManaged: false,
        };
    }

    private validateRowsDrop(rowsDrop: RowsDrop, canSetParent: boolean, dropping: boolean): void {
        const { source, target, yDelta, inside, moved, rowDragManaged, suppressMoveWhenRowDragging } = rowsDrop;

        rowsDrop.moved &&= source !== target;

        const { position, fallbackPosition } = this.computeDropPosition(moved, inside, yDelta);
        rowsDrop.position = position;

        if (!canSetParent) {
            rowsDrop.newParent = null;
        }

        this.enforceSuppressMoveWhenRowDragging(rowsDrop, suppressMoveWhenRowDragging, 'initial');

        const isRowValidDropPosition = (!rowDragManaged || rowsDrop.allowed) && this.gos.get('isRowValidDropPosition');
        if (isRowValidDropPosition) {
            this.applyDropValidator(rowsDrop, canSetParent, dropping, rowDragManaged, isRowValidDropPosition);
        }

        if (rowDragManaged) {
            rowsDrop.rows = this.filterRows(rowsDrop);
        }

        this.beans.groupEditSvc?.clearNewSameParent(rowsDrop, canSetParent);

        this.enforceSuppressMoveWhenRowDragging(rowsDrop, suppressMoveWhenRowDragging, 'final');

        if (rowsDrop.position === 'inside' && (!rowsDrop.allowed || !rowsDrop.newParent)) {
            rowsDrop.position = fallbackPosition;
        }
    }

    private computeDropPosition(
        moved: boolean,
        inside: boolean,
        yDelta: number
    ): {
        position: RowDropTargetPosition;
        fallbackPosition: 'above' | 'below';
    } {
        const fallbackPosition: 'above' | 'below' = yDelta < 0 ? 'above' : 'below';
        if (!moved) {
            return { position: 'none', fallbackPosition };
        }
        return { position: inside ? 'inside' : fallbackPosition, fallbackPosition };
    }

    private enforceSuppressMoveWhenRowDragging(
        rowsDrop: RowsDrop,
        suppress: boolean,
        stage: 'initial' | 'final'
    ): void {
        if (!suppress) {
            return;
        }
        if (stage === 'initial') {
            if (!rowsDrop.moved) {
                rowsDrop.allowed = false;
            }
            return;
        }
        if (!rowsDrop.rows.length || rowsDrop.position === 'none') {
            rowsDrop.allowed = false;
        }
    }

    private applyDropValidator(
        rowsDrop: RowsDrop,
        canSetParent: boolean,
        dropping: boolean,
        rowDragManaged: boolean,
        validator: (params: RowsDrop) => boolean | RowsDropCustomResult | null
    ): void {
        this.beans.groupEditSvc?.clearNewSameParent(rowsDrop, canSetParent);
        const result = validator(rowsDrop);
        if (!result) {
            rowsDrop.allowed = false;
            return;
        }
        if (typeof result !== 'object') {
            return;
        }
        if (result.rows !== undefined) {
            rowsDrop.rows = result.rows ?? [];
        }
        if (canSetParent && result.newParent !== undefined) {
            rowsDrop.newParent = result.newParent;
        }
        if (result.target !== undefined) {
            rowsDrop.target = result.target;
        }
        if (result.position) {
            rowsDrop.position = result.position;
        }
        if (result.allowed !== undefined) {
            rowsDrop.allowed = result.allowed;
        } else if (!rowDragManaged) {
            rowsDrop.allowed = true;
        }
        const draggingEvent = rowsDrop.draggingEvent;
        if (result.changed && draggingEvent) {
            draggingEvent.changed = true;
        }
        if (!dropping && result.highlight !== undefined) {
            rowsDrop.highlight = result.highlight;
        }
    }

    public addRowDropZone(params: RowDropZoneParams & { fromGrid?: boolean }): void {
        if (!params.getContainer()) {
            _warn(55);
            return;
        }

        const dragAndDrop = this.beans.dragAndDrop!;
        if (dragAndDrop.findExternalZone(params.getContainer())) {
            _warn(56);
            return;
        }

        const processedParams: RowDropZoneParams = params.fromGrid
            ? params
            : {
                  getContainer: params.getContainer,
                  onDragEnter:
                      params.onDragEnter && ((e) => params.onDragEnter!(this.rowDragEvent('rowDragEnter', e as any))),
                  onDragLeave:
                      params.onDragLeave && ((e) => params.onDragLeave!(this.rowDragEvent('rowDragLeave', e as any))),
                  onDragging:
                      params.onDragging && ((e) => params.onDragging!(this.rowDragEvent('rowDragMove', e as any))),
                  onDragStop:
                      params.onDragStop && ((e) => params.onDragStop!(this.rowDragEvent('rowDragEnd', e as any))),
                  onDragCancel:
                      params.onDragCancel &&
                      ((e) => params.onDragCancel!(this.rowDragEvent('rowDragCancel', e as any))),
              };

        const dropTarget: DropTarget = {
            isInterestedIn: (type: DragSourceType) => type === DragSourceType.RowDrag,
            getIconName: () => 'move',
            external: true,
            ...(processedParams as any),
        };
        dragAndDrop.addDropTarget(dropTarget);
        this.addDestroyFunc(() => dragAndDrop.removeDropTarget(dropTarget));
    }

    public getRowDropZone(events?: RowDropZoneEvents): RowDropZoneParams {
        const result: InternalRowDropZoneParams = {
            getContainer: this.getContainer.bind(this),
            onDragEnter: (e) => {
                this.onDragEnter(e);
                events?.onDragEnter?.(this.rowDragEvent('rowDragEnter', e));
            },
            onDragLeave: (e) => {
                this.onDragLeave(e);
                events?.onDragLeave?.(this.rowDragEvent('rowDragLeave', e));
            },
            onDragging: (e) => {
                this.onDragging(e);
                events?.onDragging?.(this.rowDragEvent('rowDragMove', e));
            },
            onDragStop: (e) => {
                this.onDragStop(e);
                events?.onDragStop?.(this.rowDragEvent('rowDragEnd', e));
            },
            onDragCancel: (e) => {
                this.onDragCancel(e);
                events?.onDragCancel?.(this.rowDragEvent('rowDragCancel', e));
            },
            fromGrid: true /* @private */,
        };
        return result as RowDropZoneParams; // Cast to hide the internal properties
    }

    private getOverNode(y: number): RowNode | undefined {
        const { pageBounds, rowModel } = this.beans;
        const mouseIsPastLastRow = y > pageBounds.getCurrentPagePixelRange().pageLastPixel;
        const overIndex = mouseIsPastLastRow ? -1 : rowModel.getRowIndexAtPixel(y);
        return overIndex >= 0 ? rowModel.getRow(overIndex) : undefined;
    }

    private rowDragEvent<T extends RowDragEventType>(
        type: T,
        draggingEvent: RowDraggingEvent
    ): RowDragEvent<any, any, T> {
        const beans = this.beans;
        const { dragItem, dropTarget: rowsDrop, event, vDirection } = draggingEvent;
        const withRowsDrop = rowsDrop?.rootNode === beans.rowModel.rootNode;
        const y = withRowsDrop ? rowsDrop.y : _getNormalisedMousePosition(beans, draggingEvent).y;
        const overNode = withRowsDrop ? rowsDrop.overNode : this.getOverNode(y);
        const overIndex = withRowsDrop ? rowsDrop.overIndex : overNode?.rowIndex ?? -1;
        return {
            api: beans.gridApi,
            context: beans.gridOptions.context,
            type,
            event,
            node: dragItem.rowNode!,
            nodes: dragItem.rowNodes!,
            overIndex,
            overNode,
            y,
            vDirection,
            rowsDrop,
        };
    }

    private dispatchGridEvent(type: RowDragEventType, draggingEvent: RowDraggingEvent): void {
        const event = this.rowDragEvent(type, draggingEvent);
        this.eventSvc.dispatchEvent(event);
    }

    public onDragLeave(draggingEvent: RowDraggingEvent): void {
        this.dispatchGridEvent('rowDragLeave', draggingEvent);
        this.stopDragging(draggingEvent, false);
    }

    public onDragStop(draggingEvent: RowDraggingEvent): void {
        const previousRowsDrop = (this.lastDraggingEvent?.dropTarget as RowsDrop | null) ?? null;
        const rowsDrop = this.makeRowsDrop(this.lastDraggingEvent, draggingEvent, false, true);
        this.dispatchGridEvent('rowDragEnd', draggingEvent);
        if (
            rowsDrop?.allowed &&
            rowsDrop.rowDragManaged &&
            (!previousRowsDrop?.droppedManaged || rowsDropChanged(previousRowsDrop, rowsDrop))
        ) {
            this.dropRows(rowsDrop); // Drop the rows after dragging
        }
        this.stopDragging(draggingEvent, true);
    }

    public onDragCancel(draggingEvent: RowDraggingEvent): void {
        this.dispatchGridEvent('rowDragCancel', draggingEvent);
        this.stopDragging(draggingEvent, true);
    }

    private stopDragging(draggingEvent: RowDraggingEvent, final: boolean): void {
        this.clearAutoScroll();
        this.beans.groupEditSvc?.stopDragging(final);
        this.beans.rowDropHighlightSvc?.fromDrag(null);
        setRowNodesDragging(draggingEvent.dragItem.rowNodes, false);
        this.lastDraggingEvent = null;
    }

    private clearAutoScroll(): void {
        this.autoScroll?.ensureCleared();
        this.autoScrollChanged = false;
        this.autoScrollChanging = false;
        this.autoScrollOldV = null;
    }

    /** Drag and drop. Returns false if at least a row was moved, otherwise true */
    private dropRows(rowsDrop: RowsDrop): boolean {
        rowsDrop.droppedManaged = true;
        return rowsDrop.sameGrid ? this.csrmMoveRows(rowsDrop) : this.csrmAddRows(rowsDrop);
    }

    private csrmAddRows({ position, target, rows }: RowsDrop): boolean {
        const getRowIdFunc = _getRowIdCallback(this.gos);
        const clientSideRowModel = this.beans.rowModel as IClientSideRowModel;

        const add = rows
            .filter(
                ({ data, rowPinned }) =>
                    !clientSideRowModel.getRowNode(getRowIdFunc?.({ data, level: 0, rowPinned }) ?? data.id)
            )
            .map(({ data }) => data);

        if (add.length === 0) {
            return false; // Nothing to add
        }

        let addIndex: number | undefined;
        if (target) {
            const leaf = target.sourceRowIndex >= 0 ? target : _csrmFirstLeaf(target);
            if (leaf) {
                addIndex = leaf.sourceRowIndex + (position === 'above' ? 0 : 1);
            }
        }
        clientSideRowModel.updateRowData({ add, addIndex });

        return true;
    }

    private filterRows(rowsDrop: RowsDrop): IRowNode[] {
        const { groupEditSvc } = this.beans;
        const { rows, sameGrid } = rowsDrop;
        let filtered: IRowNode[] | undefined;
        for (let i = 0, len = rows.length; i < len; ++i) {
            let valid = true;
            const row = rows[i];
            if (
                !row ||
                row.footer ||
                (sameGrid && row.destroyed && !row.group) ||
                !this.csrmGetLeaf(row) // No leaf to move, so nothing to do
            ) {
                valid = false;
            }
            if (valid && groupEditSvc && !groupEditSvc.canDropRow(row, rowsDrop)) {
                valid = false;
            }
            if (valid) {
                filtered?.push(row);
            } else {
                filtered ??= rows.slice(0, i); // Lazy initialization of the filtered array
            }
        }
        return filtered ?? rows; // If all rows are valid, return the original array
    }

    private csrmMoveRows(rowsDrop: RowsDrop): boolean {
        const groupEditSvc = this.beans.groupEditSvc;
        if (groupEditSvc?.isGroupingDrop(rowsDrop)) {
            return groupEditSvc.dropGroupEdit(rowsDrop);
        }
        return this.csrmMoveRowsReorder(rowsDrop);
    }

    private csrmMoveRowsReorder({ position, target, rows, newParent, rootNode }: RowsDrop): boolean {
        let changed = false;

        const leafs = new Set<RowNode>();
        for (const row of rows as RowNode[]) {
            if (newParent && row.parent !== newParent) {
                row.treeParent = newParent as RowNode;
                changed = true;
            }
            const leafRow = this.csrmGetLeaf(row);
            if (leafRow) {
                leafs.add(leafRow);
            }
        }

        if (!changed && leafs.size === 0) {
            return false; // Nothing to move
        }

        // Get the focussed cell so we can ensure it remains focussed after the move
        const focusSvc = this.beans.focusSvc;
        const cellPosition = focusSvc.getFocusedCell();
        const cellCtrl = cellPosition && _getCellByPosition(this.beans, cellPosition);

        if (leafs.size && _csrmReorderAllLeafs((rootNode as RowNode)._leafs, leafs, target, position === 'above')) {
            changed = true;
        }

        if (!changed) {
            return false;
        }

        const clientSideRowModel = this.beans.rowModel as IClientSideRowModel;
        const changedRowNodes = new ChangedRowNodes();
        changedRowNodes.reordered = true;
        clientSideRowModel.refreshModel({
            step: 'group',
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedPath: new ChangedPath(false, rootNode as RowNode),
            changedRowNodes,
        });

        // Get the focussed cell so we can ensure it remains focussed after the move
        if (cellCtrl) {
            cellCtrl.focusCell();
        } else {
            focusSvc.clearFocusedCell();
        }
        return true;
    }

    private csrmGetLeaf(row: IRowNode): RowNode | undefined {
        if (row.sourceRowIndex >= 0) {
            return row.destroyed ? undefined : (row as RowNode);
        }
        const groupEditSvc = this.beans.groupEditSvc;
        if (groupEditSvc) {
            return groupEditSvc.csrmFirstLeaf(row) as RowNode | undefined;
        }
        return _csrmFirstLeaf(row);
    }
}

const rowsDropChanged = (a: RowsDrop | null | undefined, b: RowsDrop): boolean =>
    a !== b &&
    (!a ||
        a.sameGrid !== b.sameGrid ||
        a.allowed !== b.allowed ||
        a.position !== b.position ||
        a.target !== b.target ||
        a.source !== b.source ||
        a.newParent !== b.newParent ||
        !_areEqual(a.rows, b.rows));

const compareRowIndex = ({ rowIndex: a }: IRowNode, { rowIndex: b }: IRowNode): number =>
    a !== null && b !== null ? a - b : 0;

const setRowNodesDragging = (rowNodes: IRowNode[] | null | undefined, dragging: boolean): void => {
    for (let i = 0, len = rowNodes?.length || 0; i < len; ++i) {
        const rowNode = rowNodes![i] as RowNode;
        if (rowNode.dragging !== dragging) {
            rowNode.dragging = dragging;
            rowNode.dispatchRowEvent('draggingChanged');
        }
    }
};

const deltaDraggingTarget = (rowModel: IRowModel, rowsDrop: RowsDrop): RowNode | null => {
    let bestTarget = null;
    let current = rowsDrop.target;
    if (current && rowsDrop.rows.indexOf(current) < 0) {
        return null;
    }
    const source = rowsDrop.source;
    if (!current || !source) {
        return null;
    }
    let count = current.rowIndex! - source.rowIndex!;
    const increment = count < 0 ? -1 : 1;
    count = rowsDrop.suppressMoveWhenRowDragging ? Math.abs(count) : 1;
    const rowsSet = new Set(rowsDrop.rows);
    do {
        const candidate = _prevOrNextDisplayedRow(rowModel, increment, current);
        if (!candidate) {
            break;
        }
        if (!rowsSet.has(candidate)) {
            bestTarget = candidate;
            --count;
        }
        current = candidate;
    } while (count > 0);
    return bestTarget;
};

const computePointerPos = (overNode: IRowNode | null | undefined, pointerY: number): RowDropTargetPosition => {
    const rowTop = overNode?.rowTop;
    const rowHeight = overNode?.rowHeight ?? 0;
    if (rowTop == null || !rowHeight || rowHeight <= 0) {
        return 'none';
    }
    const offset = pointerY - rowTop;
    const thresholdPx = rowHeight * POINTER_INSIDE_THRESHOLD;
    if (offset <= thresholdPx) {
        return 'above';
    }
    if (offset >= rowHeight - thresholdPx) {
        return 'below';
    }
    return 'inside';
};
