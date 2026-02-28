import { BeanStub } from '../../context/beanStub';
import type { DragAndDropIcon, DropTarget, GridDraggingEvent } from '../../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../../dragAndDrop/dragAndDropService';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import { BodyDropPivotTarget } from './bodyDropPivotTarget';
import { MoveColumnFeature } from './moveColumnFeature';

export interface DropListener {
    getIconName(): DragAndDropIcon | null;
    onDragEnter(params: GridDraggingEvent): void;
    onDragLeave(params: GridDraggingEvent): void;
    onDragging(params: GridDraggingEvent): void;
    onDragStop(params: GridDraggingEvent): void;
    onDragCancel(): void;
}

export class BodyDropTarget extends BeanStub implements DropTarget {
    private eSecondaryContainers: HTMLElement[][];
    private currentDropListener: DropListener | null = null;

    private moveColumnFeatureCenter: MoveColumnFeature;
    private moveColumnFeatureLeft: MoveColumnFeature;
    private moveColumnFeatureRight: MoveColumnFeature;
    private bodyDropPivotTarget: BodyDropPivotTarget;

    constructor(private readonly eContainer: HTMLElement) {
        super();
    }

    public postConstruct(): void {
        const { ctrlsSvc, dragAndDrop } = this.beans;
        ctrlsSvc.whenReady(this, (p) => {
            const eGridViewport = p.gridBodyCtrl.eGridViewport;
            const uniqueViewports: HTMLElement[] = [];
            for (const viewport of [eGridViewport, p.pinnedTopCenter.eViewport, p.pinnedBottomCenter.eViewport]) {
                if (viewport && !uniqueViewports.includes(viewport)) {
                    uniqueViewports.push(viewport);
                }
            }
            this.eSecondaryContainers = uniqueViewports.map((viewport) => [viewport]);
        });

        this.moveColumnFeatureCenter = this.createManagedBean(new MoveColumnFeature(null));
        this.moveColumnFeatureLeft = this.createManagedBean(new MoveColumnFeature('left'));
        this.moveColumnFeatureRight = this.createManagedBean(new MoveColumnFeature('right'));
        this.bodyDropPivotTarget = this.createManagedBean(new BodyDropPivotTarget(null));

        dragAndDrop!.addDropTarget(this);
        this.addDestroyFunc(() => dragAndDrop!.removeDropTarget(this));
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return (
            type === DragSourceType.HeaderCell ||
            (type === DragSourceType.ToolPanel && this.gos.get('allowDragFromColumnsToolPanel'))
        );
    }

    public getSecondaryContainers(): HTMLElement[][] {
        return this.eSecondaryContainers;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public getIconName(): DragAndDropIcon | null {
        return this.currentDropListener?.getIconName() ?? null;
    }

    // we want to use the bodyPivotTarget if the user is dragging columns in from the toolPanel
    // and we are in pivot mode, as it has to logic to set pivot/value/group on the columns when
    // dropped into the grid's body.
    private isDropColumnInPivotMode(draggingEvent: GridDraggingEvent): boolean {
        // in pivot mode, then if moving a column (ie didn't come from toolpanel) then it's
        // a standard column move, however if it came from the toolpanel, then we are introducing
        // dimensions or values to the grid
        return this.beans.colModel.isPivotMode() && draggingEvent.dragSource.type === DragSourceType.ToolPanel;
    }

    public onDragEnter(draggingEvent: GridDraggingEvent): void {
        // we pick the drop listener depending on whether we are in pivot mode are not. if we are
        // in pivot mode, then dropping cols changes the row group, pivot, value stats. otherwise
        // we change visibility state and position.
        this.currentDropListener = this.isDropColumnInPivotMode(draggingEvent)
            ? this.bodyDropPivotTarget
            : this.getMoveColumnFeature(draggingEvent);
        this.currentDropListener.onDragEnter(draggingEvent);
    }

    public onDragLeave(params: GridDraggingEvent): void {
        this.currentDropListener?.onDragLeave(params);
        this.currentDropListener = null;
    }

    public onDragging(params: GridDraggingEvent): void {
        if (!this.currentDropListener) {
            return;
        }

        if (this.currentDropListener !== this.bodyDropPivotTarget) {
            const moveFeature = this.getMoveColumnFeature(params);
            if (this.currentDropListener !== moveFeature) {
                this.currentDropListener.onDragLeave(params);
                this.currentDropListener = moveFeature;
                this.currentDropListener.onDragEnter(params);
            }
        }

        this.currentDropListener.onDragging(params);
    }

    public onDragStop(params: GridDraggingEvent): void {
        this.currentDropListener?.onDragStop(params);
        this.currentDropListener = null;
    }

    public onDragCancel(): void {
        this.currentDropListener?.onDragCancel();
        this.currentDropListener = null;
    }

    private getMoveColumnFeature(draggingEvent: GridDraggingEvent): MoveColumnFeature {
        switch (this.getPinnedSection(draggingEvent)) {
            case 'left':
                return this.moveColumnFeatureLeft;
            case 'right':
                return this.moveColumnFeatureRight;
            default:
                return this.moveColumnFeatureCenter;
        }
    }

    private getPinnedSection(draggingEvent: GridDraggingEvent): ColumnPinnedType {
        const target = draggingEvent.dropZoneTarget;
        const targetElement = target instanceof Element ? target : null;
        if (targetElement?.closest('.ag-grid-pinned-left-cells')) {
            return 'left';
        }
        if (targetElement?.closest('.ag-grid-pinned-right-cells')) {
            return 'right';
        }
        if (targetElement?.closest('.ag-grid-scrolling-cells')) {
            return null;
        }

        const rect = this.eContainer.getBoundingClientRect();
        const x = draggingEvent.event.clientX - rect.left;
        const { visibleCols } = this.beans;
        const leftPinnedWidth = visibleCols.getLeftStickyColumnContainerWidth();
        const rightPinnedWidth = visibleCols.getRightStickyColumnContainerWidth();

        if (x < leftPinnedWidth) {
            return 'left';
        }

        if (x > rect.width - rightPinnedWidth) {
            return 'right';
        }

        return null;
    }
}
