import { BaseDragAndDropService } from '../agStack/core/baseDragAndDropService';
import type { IComponent } from '../agStack/interfaces/iComponent';
import type {
    AgDragSource,
    AgDraggingEvent,
    AgDropTarget,
    IDragAndDropImage,
} from '../agStack/interfaces/iDragAndDrop';
import type { AgPromise } from '../agStack/utils/promise';
import { _getDragAndDropImageCompDetails } from '../components/framework/userCompUtils';
import type { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { DragItem } from '../interfaces/iDragItem';
import { _warn } from '../validation/logging';

export enum DragSourceType {
    ToolPanel,
    HeaderCell,
    RowDrag,
    ChartPanel,
    AdvancedFilterBuilder,
}

/** This is used internally. `DragSource` is used for external-facing things */
export interface GridDragSource<
    TDraggingEvent extends AgDraggingEvent<
        DragSourceType,
        DragItem,
        DragAndDropIcon,
        TDraggingEvent
    > = GridDraggingEvent,
> extends AgDragSource<DragSourceType, DragItem, DragAndDropIcon, TDraggingEvent> {
    /** Callback for entering the grid */
    onGridEnter?: (dragItem: DragItem | null) => void;
    /** Callback for exiting the grid */
    onGridExit?: (dragItem: DragItem | null) => void;
}

export interface DropTarget extends AgDropTarget<DragSourceType, DragItem, DragAndDropIcon, GridDraggingEvent> {}

/** This is used internally. `DraggingEvent` is used for external-facing things */
export interface GridDraggingEvent<TData = any, TContext = any>
    extends AgDraggingEvent<DragSourceType, DragItem, DragAndDropIcon, GridDraggingEvent>,
        AgGridCommon<TData, TContext> {}

export type DragAndDropIcon =
    | 'pinned'
    | 'move'
    | 'left'
    | 'right'
    | 'group'
    | 'aggregate'
    | 'pivot'
    | 'notAllowed'
    | 'hide';

export class DragAndDropService extends BaseDragAndDropService<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    DragSourceType,
    DragItem,
    DragAndDropIcon,
    GridDraggingEvent,
    GridDragSource
> {
    protected override createEvent(
        event: AgDraggingEvent<DragSourceType, DragItem, DragAndDropIcon, GridDraggingEvent>
    ): GridDraggingEvent {
        return _addGridCommonParams(this.gos, event);
    }

    protected override createDragImageComp(
        dragSource: GridDragSource
    ): AgPromise<IDragAndDropImage & IComponent<any>> | undefined {
        const { gos, beans } = this;

        const userCompDetails = _getDragAndDropImageCompDetails(
            beans.userCompFactory,
            _addGridCommonParams(gos, {
                dragSource,
            })
        );

        return userCompDetails?.newAgStackInstance();
    }

    protected override handleEnter(dragSource: GridDragSource | null, dragItem: DragItem | null): void {
        dragSource?.onGridEnter?.(dragItem);
    }

    protected override handleExit(dragSource: GridDragSource | null, dragItem: DragItem | null): void {
        dragSource?.onGridExit?.(dragItem);
    }

    protected override warnNoBody(): void {
        _warn(54);
    }

    public isDropZoneWithinThisGrid(
        draggingEvent: AgDraggingEvent<DragSourceType, DragItem, DragAndDropIcon, GridDraggingEvent>
    ): boolean {
        return this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.contains(draggingEvent.dropZoneTarget);
    }

    public registerGridDropTarget(elementFn: () => HTMLElement, ctrl: BeanStub): void {
        // this drop target is just used to see if the drop event is inside the grid
        const dropTarget: DropTarget = {
            getContainer: elementFn,
            isInterestedIn: (type) => type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel,
            getIconName: () => 'notAllowed',
        };
        this.addDropTarget(dropTarget);
        ctrl.addDestroyFunc(() => this.removeDropTarget(dropTarget));
    }
}
