import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IComponent } from '../interfaces/iComponent';
import type { DragListenerParams } from '../interfaces/iDrag';
import type {
    AgDragSource,
    AgDraggingEvent,
    AgDropTarget,
    IDragAndDropImage,
    IDragAndDropService,
} from '../interfaces/iDragAndDrop';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _removeFromArray } from '../utils/array';
import { _getPageBody, _getRootNode } from '../utils/document';
import { _anchorElementToMouseMoveEvent } from '../utils/event';
import type { AgPromise } from '../utils/promise';
import { AgBeanStub } from './agBeanStub';

interface DragSourceAndParams<
    TDragSourceType extends number,
    TDragItem,
    TDragAndDropIcon extends string,
    TDraggingEvent extends AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>,
    TDragSource extends AgDragSource<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>,
> extends DragListenerParams {
    dragSource: TDragSource;
}

export abstract class BaseDragAndDropService<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TDragSourceType extends number,
        TDragItem,
        TDragAndDropIcon extends string,
        TDraggingEvent extends AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>,
        TDragSource extends AgDragSource<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>,
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IDragAndDropService<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent, TDragSource>
{
    beanName = 'dragAndDrop' as const;

    private readonly dragSourceAndParamsList: DragSourceAndParams<
        TDragSourceType,
        TDragItem,
        TDragAndDropIcon,
        TDraggingEvent,
        TDragSource
    >[] = [];

    private dragItem: TDragItem | null = null;
    private dragInitialSourcePointerOffsetX: number = 0;
    private dragInitialSourcePointerOffsetY: number = 0;
    private lastMouseEvent: MouseEvent | null = null;
    private lastDraggingEvent: TDraggingEvent | null = null;
    private dragSource: TDragSource | null = null;

    private dragImageParent: HTMLElement | ShadowRoot | null = null;
    private dragImageCompPromise: AgPromise<IComponent<any> & IDragAndDropImage> | null = null;
    private dragImageComp: (IComponent<any> & IDragAndDropImage) | null = null;
    private dragImageLastIcon: TDragAndDropIcon | null | undefined = undefined;
    private dragImageLastLabel: string | null | undefined = undefined;

    private dropTargets: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>[] = [];
    private lastDropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent> | null = null;

    protected abstract createEvent(
        event: AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>
    ): TDraggingEvent;

    protected abstract createDragImageComp(
        dragSource: TDragSource
    ): AgPromise<IDragAndDropImage & IComponent<any>> | undefined;

    protected abstract handleEnter(dragSource: TDragSource | null, dragItem: TDragItem | null): void;

    protected abstract handleExit(dragSource: TDragSource | null, dragItem: TDragItem | null): void;

    protected abstract warnNoBody(): void;

    public addDragSource(dragSource: TDragSource, allowTouch = false): void {
        const entry: DragSourceAndParams<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent, TDragSource> = {
            capturePointer: true,
            dragSource,
            eElement: dragSource.eElement,
            dragStartPixels: dragSource.dragStartPixels,
            onDragStart: (mouseEvent: MouseEvent) => this.onDragStart(dragSource, mouseEvent),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this),
            onDragCancel: this.onDragCancel.bind(this),
            includeTouch: allowTouch,
        };

        this.dragSourceAndParamsList.push(entry);
        this.beans.dragSvc!.addDragSource(entry);
    }

    public setDragImageCompIcon(iconName: TDragAndDropIcon | null, shake: boolean = false): void {
        const component = this.dragImageComp;
        if (component && (shake || this.dragImageLastIcon !== iconName)) {
            this.dragImageLastIcon = iconName;
            component.setIcon(iconName, shake);
        }
    }

    public removeDragSource(dragSource: TDragSource): void {
        const { dragSourceAndParamsList, beans } = this;
        const sourceAndParams = dragSourceAndParamsList.find((item) => item.dragSource === dragSource);
        if (sourceAndParams) {
            beans.dragSvc?.removeDragSource(sourceAndParams);
            _removeFromArray(dragSourceAndParamsList, sourceAndParams);
        }
    }

    public override destroy(): void {
        const { dragSourceAndParamsList, dropTargets, beans } = this;
        const dragSvc = beans.dragSvc;
        for (const sourceAndParams of dragSourceAndParamsList) {
            dragSvc?.removeDragSource(sourceAndParams);
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

    private onDragStart(dragSource: TDragSource, mouseEvent: MouseEvent): void {
        this.lastMouseEvent = mouseEvent;
        this.dragSource = dragSource;
        this.dragItem = dragSource.getDragItem();

        const rect = dragSource.eElement.getBoundingClientRect();
        this.dragInitialSourcePointerOffsetX = mouseEvent.clientX - rect.left;
        this.dragInitialSourcePointerOffsetY = mouseEvent.clientY - rect.top;

        dragSource.onDragStarted?.();

        this.createAndUpdateDragImageComp(dragSource);
    }

    private onDragStop(mouseEvent: MouseEvent): void {
        const { dragSource, lastDropTarget } = this;
        dragSource?.onDragStopped?.();
        if (lastDropTarget) {
            const dragEndEvent = this.dropTargetEvent(lastDropTarget, mouseEvent, false);
            lastDropTarget.onDragStop?.(dragEndEvent);
        }
        this.clearDragAndDropProperties();
    }

    private onDragCancel(): void {
        const { dragSource, lastDropTarget, lastMouseEvent } = this;
        dragSource?.onDragCancelled?.();

        if (lastDropTarget && lastMouseEvent) {
            const dragCancelEvent = this.dropTargetEvent(lastDropTarget, lastMouseEvent, false);
            lastDropTarget.onDragCancel?.(dragCancelEvent);
        }
        this.clearDragAndDropProperties();
    }

    private onDragging(mouseEvent: MouseEvent, fromNudge: boolean = false): void {
        this.positionDragImageComp(mouseEvent);

        // check if mouseEvent intersects with any of the drop targets
        const dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent> | null =
            this.findCurrentDropTarget(mouseEvent);

        const { lastDropTarget, dragSource, dragItem } = this;

        let needUpdate = false;
        if (dropTarget !== lastDropTarget) {
            needUpdate = true;

            if (lastDropTarget) {
                const dragLeaveEvent = this.dropTargetEvent(lastDropTarget, mouseEvent, fromNudge);
                lastDropTarget.onDragLeave?.(dragLeaveEvent);
            }

            if (lastDropTarget !== null && !dropTarget) {
                this.handleExit(dragSource, dragItem);
            } else if (lastDropTarget === null && dropTarget) {
                this.handleEnter(dragSource, dragItem);
            }

            if (dropTarget) {
                const dragEnterEvent = this.dropTargetEvent(dropTarget, mouseEvent, fromNudge);
                dropTarget.onDragEnter?.(dragEnterEvent);
            }

            this.lastDropTarget = dropTarget;
        } else if (dropTarget) {
            const dragMoveEvent = this.dropTargetEvent(dropTarget, mouseEvent, fromNudge);
            dropTarget.onDragging?.(dragMoveEvent);
            if (dragMoveEvent?.changed) {
                needUpdate = true;
            }
        }

        this.lastMouseEvent = mouseEvent;

        if (needUpdate) {
            this.updateDragImageComp();
        }
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
        this.dragInitialSourcePointerOffsetX = 0;
        this.dragInitialSourcePointerOffsetY = 0;
        this.dragSource = null;
    }

    private getAllContainersFromDropTarget(
        dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>
    ): HTMLElement[][] {
        const secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        const containers: HTMLElement[][] = [[dropTarget.getContainer()]];

        return secondaryContainers ? containers.concat(secondaryContainers) : containers;
    }

    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    private isMouseOnDropTarget(
        mouseEvent: MouseEvent,
        dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>
    ): boolean {
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

    private findCurrentDropTarget(
        mouseEvent: MouseEvent
    ): AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent> | null {
        const validDropTargets = this.dropTargets.filter((target) => this.isMouseOnDropTarget(mouseEvent, target));
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

    public addDropTarget(dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>) {
        this.dropTargets.push(dropTarget);
    }

    public removeDropTarget(dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>) {
        this.dropTargets = this.dropTargets.filter((target) => target.getContainer() !== dropTarget.getContainer());
    }

    public hasExternalDropZones(): boolean {
        return this.dropTargets.some((zones) => zones.external);
    }

    public findExternalZone(
        container: HTMLElement
    ): AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent> | null {
        return this.dropTargets.find((zone) => zone.external && zone.getContainer() === container) || null;
    }

    private dropTargetEvent(
        dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon, TDraggingEvent>,
        mouseEvent: MouseEvent,
        fromNudge: boolean
    ): TDraggingEvent {
        const {
            dragSource,
            dragItem,
            lastDraggingEvent,
            lastMouseEvent,
            dragInitialSourcePointerOffsetX,
            dragInitialSourcePointerOffsetY,
        } = this;
        const dropZoneTarget = dropTarget.getContainer();
        const rect = dropZoneTarget.getBoundingClientRect();
        const { clientX, clientY } = mouseEvent;
        const xDir = clientX - (lastMouseEvent?.clientX || 0);
        const yDir = clientY - (lastMouseEvent?.clientY || 0);

        const draggingEvent = this.createEvent({
            event: mouseEvent,
            x: clientX - rect.left, // relative x
            y: clientY - rect.top, // relative y
            vDirection: yDir > 0 ? 'down' : yDir < 0 ? 'up' : null,
            hDirection: xDir < 0 ? 'left' : xDir > 0 ? 'right' : null,
            initialSourcePointerOffsetX: dragInitialSourcePointerOffsetX,
            initialSourcePointerOffsetY: dragInitialSourcePointerOffsetY,
            dragSource: dragSource!,
            fromNudge,
            dragItem: dragItem!,
            dropZoneTarget,
            dropTarget: lastDraggingEvent?.dropTarget ?? null, // updated by rowDragFeature
            changed: !!lastDraggingEvent?.changed,
        });
        this.lastDraggingEvent = draggingEvent;
        return draggingEvent;
    }

    private positionDragImageComp(event: MouseEvent): void {
        const gui = this.dragImageComp?.getGui();
        if (gui) {
            _anchorElementToMouseMoveEvent(gui, event, this.beans);
        }
    }

    private removeDragImageComp(comp: (IComponent<any> & IDragAndDropImage) | null): void {
        if (this.dragImageComp === comp) {
            this.dragImageComp = null;
        }
        if (comp) {
            comp.getGui()?.remove();
            this.destroyBean(comp);
        }
    }

    private createAndUpdateDragImageComp(dragSource: TDragSource): void {
        const promise = this.createDragImageComp(dragSource) ?? null;

        this.dragImageCompPromise = promise;
        promise?.then((dragImageComp) => {
            if (promise !== this.dragImageCompPromise || !this.lastMouseEvent || !this.isAlive()) {
                this.destroyBean(dragImageComp);
                return; // New promise was started, ignore this old one.
            }

            this.dragImageCompPromise = null;
            this.dragImageLastIcon = undefined;
            this.dragImageLastLabel = undefined;
            const oldDragImageComp = this.dragImageComp;
            if (oldDragImageComp !== dragImageComp) {
                this.dragImageComp = dragImageComp;
                this.removeDragImageComp(oldDragImageComp);
            }

            if (dragImageComp) {
                this.appendDragImageComp(dragImageComp);
                this.updateDragImageComp();
            }
        });
    }

    private appendDragImageComp(component: IComponent<any> & IDragAndDropImage): void {
        const eGui = component.getGui();
        const style = eGui.style;

        style.position = 'absolute';
        style.zIndex = '9999';
        if (this.beans.dragSvc?.hasPointerCapture()) {
            style.pointerEvents = 'none'; // stops the ghost image from interfering with scrolling
        }

        this.gos.setInstanceDomData(eGui);
        this.beans.environment.applyThemeClasses(eGui);

        style.top = '20px';
        style.left = '20px';

        const targetEl = _getPageBody(this.beans);
        this.dragImageParent = targetEl;
        if (!targetEl) {
            this.warnNoBody();
        } else {
            targetEl.appendChild(eGui);
        }
    }

    private updateDragImageComp(): void {
        const { dragImageComp, dragSource, lastDropTarget, lastDraggingEvent, dragImageLastLabel } = this;
        if (!dragImageComp) {
            return;
        }

        this.setDragImageCompIcon(lastDropTarget?.getIconName?.(lastDraggingEvent) ?? null);

        let label = dragSource?.dragItemName;
        if (typeof label === 'function') {
            label = label(lastDraggingEvent);
        }
        label ||= '';

        if (dragImageLastLabel !== label) {
            this.dragImageLastLabel = label;
            dragImageComp.setLabel(label);
        }
    }
}
