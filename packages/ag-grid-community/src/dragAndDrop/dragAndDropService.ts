import type { HorizontalDirection, VerticalDirection } from '../agStack/constants/direction';
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

export interface DragSource extends AgDragSource<DragSourceType, DragItem, DragAndDropIcon> {
    /**
     * Callback for entering the grid
     */
    onGridEnter?: (dragItem: DragItem | null) => void;
    /**
     * Callback for exiting the grid
     */
    onGridExit?: (dragItem: DragItem | null) => void;
}

export interface DropTarget extends AgDropTarget<DragSourceType, DragItem, DragAndDropIcon> {}

export interface DraggingEvent<TData = any, TContext = any>
    extends AgGridCommon<TData, TContext>,
        AgDraggingEvent<DragSourceType, DragItem, DragAndDropIcon> {}

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
    DragSource
> {
    protected override warnNoBody(): void {
        _warn(54);
    }

    protected override handleEnter(dragSource: DragSource | null, dragItem: DragItem | null): void {
        dragSource?.onGridEnter?.(dragItem);
    }

    protected override handleExit(dragSource: DragSource | null, dragItem: DragItem | null): void {
        dragSource?.onGridExit?.(dragItem);
    }

    protected override createDropTargetEvent(
        dropTarget: DropTarget,
        event: MouseEvent,
        hDirection: HorizontalDirection | null,
        vDirection: VerticalDirection | null,
        fromNudge: boolean
    ): DraggingEvent {
        return _addGridCommonParams(
            this.gos,
            super.createDropTargetEvent(dropTarget, event, hDirection, vDirection, fromNudge)
        );
    }

    public isDropZoneWithinThisGrid(draggingEvent: DraggingEvent): boolean {
        const gridBodyCon = this.beans.ctrlsSvc.getGridBodyCtrl();
        const gridGui = gridBodyCon.eGridBody;
        const { dropZoneTarget } = draggingEvent;

        return gridGui.contains(dropZoneTarget);
    }

    protected override createDragAndDropImageComponent(
        dragSource: DragSource
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
