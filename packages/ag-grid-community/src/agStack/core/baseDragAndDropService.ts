import type { HorizontalDirection, VerticalDirection } from '../constants/direction';
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

export abstract class BaseDragAndDropService<
        TBeanCollection extends AgCoreBeanCollection<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService
        >,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TDragSourceType extends number,
        TDragItem,
        TDragAndDropIcon extends string,
        TDragSource extends AgDragSource<TDragSourceType, TDragItem, TDragAndDropIcon>,
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IDragAndDropService<TDragSourceType, TDragItem, TDragAndDropIcon, TDragSource>
{
    beanName = 'dragAndDrop' as const;

    private dragSourceAndParamsList: {
        params: DragListenerParams;
        dragSource: TDragSource;
    }[] = [];

    private dragItem: TDragItem | null;
    private eventLastTime: MouseEvent | null;
    protected dragSource: TDragSource | null;
    private dragging: boolean;

    private dragAndDropImageComp: {
        promise: AgPromise<IComponent<any> & IDragAndDropImage>;
        comp?: IComponent<any> & IDragAndDropImage;
    } | null;
    private dragAndDropImageParent: HTMLElement | ShadowRoot;

    protected dropTargets: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>[] = [];
    private lastDropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon> | null | undefined;

    protected abstract createDragAndDropImageComponent(
        dragSource: TDragSource
    ): AgPromise<IDragAndDropImage & IComponent<any>> | undefined;

    protected abstract warnNoBody(): void;

    protected abstract handleEnter(dragSource: TDragSource | null, dragItem: TDragItem | null): void;

    protected abstract handleExit(dragSource: TDragSource | null, dragItem: TDragItem | null): void;

    public addDragSource(dragSource: TDragSource, allowTouch = false): void {
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
        this.beans.dragSvc?.addDragSource(params);
    }

    public setDragDropIcon(iconName: string | null, shake: boolean): void {
        this.dragAndDropImageComp?.comp?.setIcon(iconName, shake);
    }

    public removeDragSource(dragSource: TDragSource): void {
        const { dragSourceAndParamsList, beans } = this;
        const sourceAndParams = dragSourceAndParamsList.find((item) => item.dragSource === dragSource);

        if (sourceAndParams) {
            beans.dragSvc?.removeDragSource(sourceAndParams.params);
            _removeFromArray(dragSourceAndParamsList, sourceAndParams);
        }
    }

    public override destroy(): void {
        const { dragSourceAndParamsList, beans, dropTargets } = this;
        dragSourceAndParamsList.forEach((sourceAndParams) => beans.dragSvc?.removeDragSource(sourceAndParams.params));
        dragSourceAndParamsList.length = 0;
        dropTargets.length = 0;
        this.clearDragAndDropProperties();
        super.destroy();
    }

    public nudge(): void {
        if (this.dragging) {
            this.onDragging(this.eventLastTime!, true);
        }
    }

    private onDragStart(dragSource: TDragSource, mouseEvent: MouseEvent): void {
        this.dragging = true;
        this.dragSource = dragSource;
        this.eventLastTime = mouseEvent;
        this.dragItem = dragSource.getDragItem();

        dragSource.onDragStarted?.();

        const promise = this.createDragAndDropImageComponent(dragSource);
        if (!promise) {
            return;
        }

        this.dragAndDropImageComp = {
            promise,
        };

        promise.then((comp) => {
            if (!comp || !this.isAlive()) {
                return;
            }

            this.processDragAndDropImageComponent(comp);
            this.dragAndDropImageComp!.comp = comp;
        });
    }

    private onDragStop(mouseEvent: MouseEvent): void {
        this.dragSource?.onDragStopped?.();

        const { lastDropTarget } = this;
        if (lastDropTarget?.onDragStop) {
            const draggingEvent = this.createDropTargetEvent(lastDropTarget, mouseEvent, null, null, false);
            lastDropTarget.onDragStop(draggingEvent);
        }

        this.clearDragAndDropProperties();
    }

    private onDragCancel(): void {
        const { dragSource, lastDropTarget } = this;
        dragSource?.onDragCancelled?.();

        if (lastDropTarget?.onDragCancel) {
            lastDropTarget.onDragCancel(
                this.createDropTargetEvent(lastDropTarget, this.eventLastTime!, null, null, false)
            );
        }
        this.clearDragAndDropProperties();
    }

    private clearDragAndDropProperties(): void {
        this.eventLastTime = null;
        this.dragging = false;
        this.lastDropTarget = undefined;
        this.dragItem = null;
        this.dragSource = null;
        this.removeDragAndDropImageComponent();
    }

    private onDragging(mouseEvent: MouseEvent, fromNudge: boolean = false): void {
        const eventLastTime = this.eventLastTime;
        const hDirection = getHorizontalDirection(mouseEvent, eventLastTime);
        const vDirection = getVerticalDirection(mouseEvent, eventLastTime);

        this.eventLastTime = mouseEvent;
        this.positionDragAndDropImageComp(mouseEvent);

        // check if mouseEvent intersects with any of the drop targets
        const validDropTargets = this.dropTargets.filter((target) => this.isMouseOnDropTarget(mouseEvent, target));
        const dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon> | null =
            this.findCurrentDropTarget(mouseEvent, validDropTargets);

        const { lastDropTarget, dragSource, dragAndDropImageComp, dragItem } = this;

        if (dropTarget !== lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);

            if (lastDropTarget !== null && dropTarget === null) {
                this.handleExit(dragSource, dragItem);
            }
            if (lastDropTarget === null && dropTarget !== null) {
                this.handleEnter(dragSource, dragItem);
            }
            this.enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);

            if (dropTarget && dragAndDropImageComp) {
                const { comp, promise } = dragAndDropImageComp;
                if (comp) {
                    comp.setIcon(dropTarget.getIconName?.() ?? null, false);
                } else {
                    promise.then((resolvedComponent) => {
                        if (resolvedComponent) {
                            resolvedComponent.setIcon(dropTarget.getIconName?.() ?? null, false);
                        }
                    });
                }
            }

            this.lastDropTarget = dropTarget;
        } else if (dropTarget && dropTarget.onDragging) {
            const draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    }

    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    private isMouseOnDropTarget(
        mouseEvent: MouseEvent,
        dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>
    ): boolean {
        const allContainersFromDropTarget = getAllContainersFromDropTarget(dropTarget);
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
        mouseEvent: MouseEvent,
        validDropTargets: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>[]
    ): AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon> | null {
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
                const containers = getAllContainersFromDropTarget(dropTarget).flatMap((a) => a);
                if (containers.indexOf(el) !== -1) {
                    return dropTarget;
                }
            }
        }

        // we should never hit this point of the code because only
        // valid dropTargets should be provided to this method.
        return null;
    }

    private enterDragTargetIfExists(
        dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon> | null,
        mouseEvent: MouseEvent,
        hDirection: HorizontalDirection | null,
        vDirection: VerticalDirection | null,
        fromNudge: boolean
    ): void {
        if (!dropTarget) {
            return;
        }

        if (dropTarget.onDragEnter) {
            const dragEnterEvent = this.createDropTargetEvent(
                dropTarget,
                mouseEvent,
                hDirection,
                vDirection,
                fromNudge
            );

            dropTarget.onDragEnter(dragEnterEvent);
        }
    }

    private leaveLastTargetIfExists(
        mouseEvent: MouseEvent,
        hDirection: HorizontalDirection | null,
        vDirection: VerticalDirection | null,
        fromNudge: boolean
    ): void {
        const { lastDropTarget } = this;
        if (!lastDropTarget) {
            return;
        }

        if (lastDropTarget.onDragLeave) {
            const dragLeaveEvent = this.createDropTargetEvent(
                lastDropTarget,
                mouseEvent,
                hDirection,
                vDirection,
                fromNudge
            );

            lastDropTarget.onDragLeave(dragLeaveEvent);
        }

        this.dragAndDropImageComp?.comp?.setIcon(null, false);
    }

    public addDropTarget(dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>): void {
        this.dropTargets.push(dropTarget);
    }

    public removeDropTarget(dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>): void {
        this.dropTargets = this.dropTargets.filter((target) => target.getContainer() !== dropTarget.getContainer());
    }

    public hasExternalDropZones(): boolean {
        return this.dropTargets.some((zones) => zones.external);
    }

    public findExternalZone(container: HTMLElement): AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon> | null {
        const externalTargets = this.dropTargets.filter((target) => target.external);

        return externalTargets.find((zone) => zone.getContainer() === container) || null;
    }

    protected createDropTargetEvent(
        dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>,
        event: MouseEvent,
        hDirection: HorizontalDirection | null,
        vDirection: VerticalDirection | null,
        fromNudge: boolean
    ): AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon> {
        // localise x and y to the target
        const dropZoneTarget = dropTarget.getContainer();
        const rect = dropZoneTarget.getBoundingClientRect();
        const { dragItem, dragSource } = this;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return {
            event,
            x,
            y,
            vDirection,
            hDirection,
            dragSource: dragSource!,
            fromNudge,
            dragItem: dragItem!,
            dropZoneTarget,
        };
    }

    private positionDragAndDropImageComp(event: MouseEvent): void {
        const dragAndDropImageComponent = this.dragAndDropImageComp?.comp;

        if (!dragAndDropImageComponent) {
            return;
        }

        _anchorElementToMouseMoveEvent(dragAndDropImageComponent.getGui(), event, this.beans);
    }

    private removeDragAndDropImageComponent(): void {
        const { dragAndDropImageComp } = this;
        if (dragAndDropImageComp) {
            const { comp } = dragAndDropImageComp;
            if (comp) {
                const eGui = comp.getGui();
                this.dragAndDropImageParent?.removeChild(eGui);
                this.destroyBean(comp);
            }
        }

        this.dragAndDropImageComp = null;
    }

    private processDragAndDropImageComponent(dragAndDropImageComponent: IComponent<any> & IDragAndDropImage): void {
        const { dragSource, beans, gos } = this;

        if (!dragSource) {
            return;
        }
        const eGui = dragAndDropImageComponent.getGui();

        eGui.style.setProperty('position', 'absolute');
        eGui.style.setProperty('z-index', '9999');

        gos.setInstanceDomData(eGui);
        beans.environment.applyThemeClasses(eGui);
        dragAndDropImageComponent.setIcon(null, false);

        let { dragItemName } = dragSource;

        if (typeof dragItemName === 'function') {
            dragItemName = dragItemName();
        }

        dragAndDropImageComponent.setLabel(dragItemName || '');

        eGui.style.top = '20px';
        eGui.style.left = '20px';

        const targetEl = _getPageBody(beans);

        this.dragAndDropImageParent = targetEl;

        if (!targetEl) {
            this.warnNoBody();
        } else {
            targetEl.appendChild(eGui);
        }
    }
}

function getHorizontalDirection(event: MouseEvent, eventLastTime: MouseEvent | null): HorizontalDirection | null {
    const clientX = eventLastTime?.clientX;
    const eClientX = event.clientX;

    if (clientX === eClientX) {
        return null;
    }

    return clientX! > eClientX ? 'left' : 'right';
}

function getVerticalDirection(event: MouseEvent, eventLastTime: MouseEvent | null): VerticalDirection | null {
    const clientY = eventLastTime?.clientY;
    const eClientY = event.clientY;

    if (clientY === eClientY) {
        return null;
    }

    return clientY! > eClientY ? 'up' : 'down';
}

function getAllContainersFromDropTarget(dropTarget: AgDropTarget<any, any, any>): HTMLElement[][] {
    const secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
    const containers: HTMLElement[][] = [[dropTarget.getContainer()]];

    return secondaryContainers ? containers.concat(secondaryContainers) : containers;
}
