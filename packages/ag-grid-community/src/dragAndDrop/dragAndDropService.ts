import { _getDragAndDropImageCompDetails } from '../components/framework/userCompUtils';
import type { HorizontalDirection, VerticalDirection } from '../constants/direction';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { _stampTopLevelGridCompWithGridInstance } from '../gridBodyComp/mouseEventUtils';
import { _addGridCommonParams, _anchorElementToMouseMoveEvent, _getPageBody, _getRootNode } from '../gridOptionsUtils';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { DragItem } from '../interfaces/iDragItem';
import { _removeFromArray } from '../utils/array';
import type { AgPromise } from '../utils/promise';
import { _warn } from '../validation/logging';
import type { IDragAndDropImageComponent } from './dragAndDropImageComponent';
import type { DragListenerParams } from './dragService';
import type { RowDropZoneParams, RowsDrop } from './rowDragFeature';

export enum DragSourceType {
    ToolPanel,
    HeaderCell,
    RowDrag,
    ChartPanel,
    AdvancedFilterBuilder,
}

export type DragItemNameGetter = (draggingEvent?: DraggingEvent | null | undefined) => string | null | undefined;

export interface DragSource {
    /** The type of the drag source, used by the drop target to know where the drag originated from. */
    type: DragSourceType;
    /** Can be used to identify a specific component as the source */
    sourceId?: string;
    /** Element which, when dragged, will kick off the DnD process */
    eElement: Element;
    /** If eElement is dragged, then the dragItem is the object that gets passed around. */
    getDragItem: () => DragItem;
    /** This name appears in the drag and drop image component when dragging. */
    dragItemName: string | DragItemNameGetter | null;
    /** Icon to show when not over a drop zone */
    getDefaultIconName?: () => DragAndDropIcon;
    /** The drag source DOM Data Key, this is useful to detect if the origin grid is the same as the target grid. */
    dragSourceDomDataKey?: string;
    /** After how many pixels of dragging should the drag operation start. Default is 4. */
    dragStartPixels?: number;
    /** Callback for drag started */
    onDragStarted?: () => void;
    /** Callback for drag stopped */
    onDragStopped?: () => void;
    /** Callback for drag cancelled */
    onDragCancelled?: () => void;
    /** Callback for entering the grid */
    onGridEnter?: (dragItem: DragItem | null) => void;
    /** Callback for exiting the grid */
    onGridExit?: (dragItem: DragItem | null) => void;
}

export interface DropTarget {
    /** The main container that will get the drop. */
    getContainer(): HTMLElement;
    /** If any secondary containers. For example when moving columns in AG Grid, we listen for drops
     * in the header as well as the body (main rows and pinned rows) of the grid. */
    getSecondaryContainers?(): HTMLElement[][];
    /** Icon to show when drag is over */
    getIconName?(draggingEvent?: DraggingEvent | null | undefined): DragAndDropIcon | null | undefined;

    isInterestedIn(type: DragSourceType, el: Element): boolean;

    /**
     * If `true`, the DragSources will only be allowed to be dragged within the DragTarget that contains them.
     * This is useful for changing order of items within a container, and not moving items across containers.
     * @default false
     */
    targetContainsSource?: boolean;

    /** Callback for when drag enters */
    onDragEnter?(params: DraggingEvent): void;
    /** Callback for when drag leaves */
    onDragLeave?(params: DraggingEvent): void;
    /** Callback for when dragging */
    onDragging?(params: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop?(params: DraggingEvent): void;
    /** Callback for when the drag is cancelled */
    onDragCancel?(params: DraggingEvent): void;
    external?: boolean;
}

/** DraggingEvent type */
export type DraggingEventType = 'dragEnter' | 'dragLeave' | 'dragMove' | 'dragEnd' | 'dragCancel';

export interface DraggingEvent<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The mouse event that triggered the dragging event */
    event: MouseEvent;
    /** The type of the dragging event, can be 'dragEnter', 'dragLeave', 'dragMove', 'dragEnd', 'dragCancel' */
    type: DraggingEventType;
    /** The X position in pixel relative to the drop target */
    x: number;
    /** The Y position in pixel relative to the drop target */
    y: number;
    /** The vertical direction of the drag, can be 'up', 'down' or null */
    vDirection: VerticalDirection | null;
    /** The horizontal direction of the drag, can be 'left', 'right' or null */
    hDirection: HorizontalDirection | null;
    /** The drag source that initiated the drag */
    dragSource: DragSource;
    /** The drag item that is being dragged */
    dragItem: DragItem;
    fromNudge: boolean;
    /** The target element where the drop is happening */
    dropZoneTarget: HTMLElement;
    /** Details about the row dragging drop target. */
    rowsDrop: RowsDrop<TData, TContext> | null;
}

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

export class DragAndDropService extends BeanStub implements NamedBean {
    beanName = 'dragAndDrop' as const;

    private dragSourceAndParamsList: { params: DragListenerParams; dragSource: DragSource }[] = [];

    private dragItem: DragItem | null = null;
    private lastMouseEvent: MouseEvent | null = null;
    private lastDraggingEvent: DraggingEvent | null = null;
    private dragSource: DragSource | null = null;

    private dragImageCompPromise: AgPromise<IDragAndDropImageComponent> | null = null;
    private dragImageComp: IDragAndDropImageComponent | null = null;
    private dragImageParent: HTMLElement | ShadowRoot | null = null;
    private dragImageLastIcon: DragAndDropIcon | null | undefined = undefined;
    private dragImageLastLabel: string | null | undefined = undefined;

    private dropTargets: DropTarget[] = [];
    private lastDropTarget: DropTarget | null = null;

    public addDragSource(dragSource: DragSource, allowTouch = false): void {
        const params: DragListenerParams = {
            eElement: dragSource.eElement,
            dragStartPixels: dragSource.dragStartPixels,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this),
            onDragCancel: this.onDragCancel.bind(this),
            includeTouch: allowTouch,
        };

        this.dragSourceAndParamsList.push({ params: params, dragSource: dragSource });
        this.beans.dragSvc!.addDragSource(params);
    }

    public setDragImageCompIcon(iconName: DragAndDropIcon | null, shake: boolean = false): void {
        const component = this.dragImageComp;
        if (component && (shake || this.dragImageLastIcon !== iconName)) {
            this.dragImageLastIcon = iconName;
            component.setIcon(iconName, shake);
        }
    }

    public removeDragSource(dragSource: DragSource): void {
        const { dragSourceAndParamsList, beans } = this;
        const sourceAndParams = dragSourceAndParamsList.find((item) => item.dragSource === dragSource);
        if (sourceAndParams) {
            beans.dragSvc?.removeDragSource(sourceAndParams.params);
            _removeFromArray(dragSourceAndParamsList, sourceAndParams);
        }
    }

    public override destroy(): void {
        const { dragSourceAndParamsList, dropTargets, beans } = this;
        const dragSvc = beans.dragSvc;
        for (const sourceAndParams of dragSourceAndParamsList) {
            dragSvc?.removeDragSource(sourceAndParams.params);
        }
        dragSourceAndParamsList.length = 0;
        dropTargets.length = 0;
        this.clearDragAndDropProperties();
        super.destroy();
    }

    public nudge(): void {
        const lastMouseEvent = this.lastMouseEvent;
        if (lastMouseEvent) {
            this.onDragging(lastMouseEvent, true);
        }
    }

    private onDragStart(dragSource: DragSource, mouseEvent: MouseEvent): void {
        this.lastMouseEvent = mouseEvent;
        this.dragSource = dragSource;
        this.dragItem = dragSource.getDragItem();

        dragSource.onDragStarted?.();
        this.createDragImageComp(dragSource);
    }

    private onDragStop(mouseEvent: MouseEvent): void {
        const { dragSource, lastDropTarget } = this;
        dragSource?.onDragStopped?.();
        this.dropTargetEvent('dragEnd', lastDropTarget, mouseEvent);
        this.clearDragAndDropProperties();
    }

    private onDragCancel(): void {
        const { dragSource, lastDropTarget, lastMouseEvent } = this;
        dragSource?.onDragCancelled?.();

        this.dropTargetEvent('dragCancel', lastDropTarget, lastMouseEvent);
        this.clearDragAndDropProperties();
    }

    private clearDragAndDropProperties(): void {
        this.removeDragImageComp(this.dragImageComp);
        this.dragImageCompPromise = null;
        this.dragImageParent = null;
        this.dragImageLastIcon = undefined;
        this.dragImageLastLabel = undefined;
        this.lastMouseEvent = null;
        this.lastDraggingEvent = null;
        this.lastDropTarget = null;
        this.dragItem = null;
        this.dragSource = null;
    }

    private onDragging(mouseEvent: MouseEvent, fromNudge: boolean = false): void {
        const hDirection = this.getHorizontalDirection(mouseEvent);
        const vDirection = this.getVerticalDirection(mouseEvent);

        this.positionDragImageComp(mouseEvent);

        // check if mouseEvent intersects with any of the drop targets
        const validDropTargets = this.dropTargets.filter((target) => this.isMouseOnDropTarget(mouseEvent, target));
        const dropTarget: DropTarget | null = this.findCurrentDropTarget(mouseEvent, validDropTargets);

        const { lastDropTarget, dragSource, dragItem } = this;

        let needUpdate = false;
        if (dropTarget !== lastDropTarget) {
            needUpdate = true;

            this.dropTargetEvent('dragLeave', lastDropTarget, mouseEvent, hDirection, vDirection, fromNudge);

            if (lastDropTarget !== null && !dropTarget) {
                dragSource?.onGridExit?.(dragItem);
            } else if (lastDropTarget === null && dropTarget) {
                dragSource?.onGridEnter?.(dragItem);
            }

            this.dropTargetEvent('dragEnter', dropTarget, mouseEvent, hDirection, vDirection, fromNudge);

            this.lastDropTarget = dropTarget;
        } else {
            this.dropTargetEvent('dragMove', dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            if (this.lastDraggingEvent?.rowsDrop?.changed) {
                needUpdate = true;
            }
        }

        if (needUpdate) {
            this.updateDragImageComp();
        }
    }

    private getAllContainersFromDropTarget(dropTarget: DropTarget): HTMLElement[][] {
        const secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        const containers: HTMLElement[][] = [[dropTarget.getContainer()]];

        return secondaryContainers ? containers.concat(secondaryContainers) : containers;
    }

    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    private isMouseOnDropTarget(mouseEvent: MouseEvent, dropTarget: DropTarget): boolean {
        const allContainersFromDropTarget = this.getAllContainersFromDropTarget(dropTarget);
        let mouseOverTarget = false;

        const allContainersIntersect = (mouseEvent: MouseEvent, containers: HTMLElement[]) => {
            for (const container of containers) {
                const { width, height, left, right, top, bottom } = container.getBoundingClientRect();

                // if element is not visible, then width and height are zero
                if (width === 0 || height === 0) {
                    return false;
                }

                const horizontalFit = mouseEvent.clientX >= left && mouseEvent.clientX < right;
                const verticalFit = mouseEvent.clientY >= top && mouseEvent.clientY < bottom;

                if (!horizontalFit || !verticalFit) {
                    return false;
                }
            }
            return true;
        };

        for (const currentContainers of allContainersFromDropTarget) {
            if (allContainersIntersect(mouseEvent, currentContainers)) {
                mouseOverTarget = true;
                break;
            }
        }
        const { eElement, type } = this.dragSource!;
        if (dropTarget.targetContainsSource && !dropTarget.getContainer().contains(eElement)) {
            return false;
        }

        return mouseOverTarget && dropTarget.isInterestedIn(type, eElement);
    }

    private findCurrentDropTarget(mouseEvent: MouseEvent, validDropTargets: DropTarget[]): DropTarget | null {
        const len = validDropTargets.length;

        if (len === 0) {
            return null;
        }
        if (len === 1) {
            return validDropTargets[0];
        }

        const rootNode = _getRootNode(this.beans);

        // elementsFromPoint return a list of elements under
        // the mouseEvent sorted from topMost to bottomMost
        const elementStack = rootNode.elementsFromPoint(mouseEvent.clientX, mouseEvent.clientY) as HTMLElement[];

        // loop over the sorted elementStack to find which dropTarget comes first
        for (const el of elementStack) {
            for (const dropTarget of validDropTargets) {
                const containers = this.getAllContainersFromDropTarget(dropTarget).flatMap((a) => a);
                if (containers.indexOf(el) !== -1) {
                    return dropTarget;
                }
            }
        }

        // we should never hit this point of the code because only
        // valid dropTargets should be provided to this method.
        return null;
    }

    public addDropTarget(dropTarget: DropTarget) {
        this.dropTargets.push(dropTarget);
    }

    public removeDropTarget(dropTarget: DropTarget) {
        this.dropTargets = this.dropTargets.filter((target) => target.getContainer() !== dropTarget.getContainer());
    }

    public hasExternalDropZones(): boolean {
        return this.dropTargets.some((zones) => zones.external);
    }

    public findExternalZone(params: RowDropZoneParams): DropTarget | null {
        return this.dropTargets.find((zone) => zone.external && zone.getContainer() === params.getContainer()) || null;
    }

    public isDropZoneWithinThisGrid(draggingEvent: DraggingEvent): boolean {
        return this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.contains(draggingEvent.dropZoneTarget);
    }

    private getHorizontalDirection(event: MouseEvent): HorizontalDirection | null {
        const xDiff = event.clientX - (this.lastMouseEvent?.clientX || 0);
        return xDiff < 0 ? 'left' : xDiff > 0 ? 'right' : null;
    }

    private getVerticalDirection(event: MouseEvent): VerticalDirection | null {
        const yDiff = event.clientY - (this.lastMouseEvent?.clientY || 0);
        return yDiff > 0 ? 'down' : yDiff < 0 ? 'up' : null;
    }

    public dropTargetEvent(
        type: DraggingEventType,
        dropTarget: DropTarget | null,
        event: MouseEvent | null,
        hDirection: HorizontalDirection | null = null,
        vDirection: VerticalDirection | null = null,
        fromNudge = false
    ): void {
        if (!dropTarget || !event) {
            return; // Nothing to do.
        }

        // localise x and y to the target
        const dropZoneTarget = dropTarget.getContainer();
        const rect = dropZoneTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const { beans, dragSource, dragItem, lastDraggingEvent } = this;

        const draggingEvent: DraggingEvent = {
            api: beans.gridApi,
            context: beans.gridOptions.context,
            event,
            type,
            x,
            y,
            vDirection,
            hDirection,
            dragSource: dragSource!,
            fromNudge,
            dragItem: dragItem as DragItem,
            dropZoneTarget,
            rowsDrop: lastDraggingEvent?.rowsDrop ?? null, // updated by rowDragFeature
        };

        this.lastMouseEvent = event;
        this.lastDraggingEvent = draggingEvent;

        if (type === 'dragEnter') dropTarget.onDragEnter?.(draggingEvent);
        else if (type === 'dragLeave') dropTarget.onDragLeave?.(draggingEvent);
        else if (type === 'dragMove') dropTarget.onDragging?.(draggingEvent);
        else if (type === 'dragEnd') dropTarget.onDragStop?.(draggingEvent);
        else if (type === 'dragCancel') dropTarget.onDragCancel?.(draggingEvent);
    }

    private positionDragImageComp(event: MouseEvent): void {
        const gui = this.dragImageComp?.getGui();
        if (gui) {
            _anchorElementToMouseMoveEvent(gui, event, this.beans);
        }
    }

    private removeDragImageComp(comp: IDragAndDropImageComponent | null): void {
        if (this.dragImageComp === comp) {
            this.dragImageComp = null;
        }
        if (comp) {
            const eGui = comp.getGui();
            this.dragImageParent?.removeChild(eGui);
            this.destroyBean(comp);
        }
    }

    private createDragImageComp(dragSource: DragSource): void {
        const promise =
            _getDragAndDropImageCompDetails(
                this.beans.userCompFactory,
                _addGridCommonParams(this.gos, { dragSource })
            )?.newAgStackInstance() || null;

        this.dragImageCompPromise = promise;
        promise?.then((dragImageComp) => {
            if (promise !== this.dragImageCompPromise || !this.lastDraggingEvent || !this.isAlive()) {
                this.destroyBean(dragImageComp);
                return; // New promise was started, ignore the old one.
            }

            this.dragImageCompPromise = null;
            this.dragImageLastIcon = undefined;
            this.dragImageLastLabel = undefined;
            const oldDragImageComp = this.dragImageComp;
            if (oldDragImageComp !== dragImageComp) {
                this.removeDragImageComp(oldDragImageComp);
            }

            if (dragImageComp) {
                this.dragImageComp = dragImageComp;
                this.updateDragImageComp();
                this.appendDragImageComp(dragImageComp);
            }
        });
    }

    private appendDragImageComp(component: IDragAndDropImageComponent): void {
        const eGui = component.getGui();

        eGui.style.setProperty('position', 'absolute');
        eGui.style.setProperty('z-index', '9999');

        _stampTopLevelGridCompWithGridInstance(this.gos, eGui);
        this.beans.environment.applyThemeClasses(eGui);

        eGui.style.top = '20px';
        eGui.style.left = '20px';

        const targetEl = _getPageBody(this.beans);

        this.dragImageParent = targetEl;

        if (!targetEl) {
            _warn(54);
        } else {
            targetEl.appendChild(eGui);
        }
    }

    private updateDragImageComp(): void {
        const { dragImageComp, dragSource, lastDraggingEvent } = this;
        if (!dragImageComp) {
            return;
        }

        this.setDragImageCompIcon(this.lastDropTarget?.getIconName?.(lastDraggingEvent) ?? null);

        let label = dragSource?.dragItemName;
        if (typeof label === 'function') {
            label = (dragSource!.dragItemName as DragItemNameGetter)(lastDraggingEvent);
        }
        label ||= '';

        if (this.dragImageLastLabel !== label) {
            this.dragImageLastLabel = label;
            dragImageComp.setLabel(label);
        }
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
