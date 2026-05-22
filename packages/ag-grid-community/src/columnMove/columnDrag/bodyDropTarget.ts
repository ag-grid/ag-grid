import { BeanStub } from '../../context/beanStub';
import type { DragAndDropIcon, DropTarget, GridDraggingEvent } from '../../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../../dragAndDrop/dragAndDropService';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { HorizontalSection } from '../../interfaces/iGridSection';
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
    private eGridViewport: HTMLElement;
    private currentDropListener: DropListener | null = null;
    private lastDetectedSection: ColumnPinnedType = null;

    private moveColumnFeatures: Record<HorizontalSection, MoveColumnFeature>;
    private bodyDropPivotTargets: Record<HorizontalSection, BodyDropPivotTarget>;

    constructor(private readonly eContainer: HTMLElement) {
        super();
    }

    public postConstruct(): void {
        const { ctrlsSvc, dragAndDrop } = this.beans;
        ctrlsSvc.whenReady(this, (p) => {
            const eGridViewport = p.gridBodyCtrl.eGridViewport;
            const ePinnedTop = p.pinnedTop.eViewport;
            const ePinnedBottom = p.pinnedBottom.eViewport;
            this.eGridViewport = eGridViewport;
            const eSecondaryContainers: HTMLElement[][] = [];
            if (eGridViewport) {
                eSecondaryContainers.push([eGridViewport]);
            }
            if (ePinnedTop && ePinnedTop !== eGridViewport) {
                eSecondaryContainers.push([ePinnedTop]);
            }
            if (ePinnedBottom && ePinnedBottom !== eGridViewport && ePinnedBottom !== ePinnedTop) {
                eSecondaryContainers.push([ePinnedBottom]);
            }
            this.eSecondaryContainers = eSecondaryContainers;
        });
        const buildMoveFeature = (type: ColumnPinnedType) => this.createManagedBean(new MoveColumnFeature(type));
        this.moveColumnFeatures = {
            left: buildMoveFeature('left'),
            center: buildMoveFeature(null),
            right: buildMoveFeature('right'),
        };
        const buildDropTarget = (type: ColumnPinnedType) => this.createManagedBean(new BodyDropPivotTarget(type));
        this.bodyDropPivotTargets = {
            left: buildDropTarget('left'),
            center: buildDropTarget(null),
            right: buildDropTarget('right'),
        };

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
        return this.beans.colModel.pivotMode && draggingEvent.dragSource.type === DragSourceType.ToolPanel;
    }

    public onDragEnter(draggingEvent: GridDraggingEvent): void {
        const dropListener = this.getDropListener(draggingEvent);
        this.lastDetectedSection = null;
        this.currentDropListener = dropListener;
        dropListener.onDragEnter(draggingEvent);
    }

    public onDragLeave(params: GridDraggingEvent): void {
        const currentDropListener = this.currentDropListener;
        if (currentDropListener) {
            currentDropListener.onDragLeave(params);
            this.currentDropListener = null;
        }
        this.lastDetectedSection = null;
    }

    public onDragging(params: GridDraggingEvent): void {
        let currentDropListener = this.currentDropListener;
        if (!currentDropListener) {
            return;
        }

        const dropListener = this.getDropListener(params);
        if (currentDropListener !== dropListener) {
            currentDropListener.onDragLeave(params);
            currentDropListener = dropListener;
            this.currentDropListener = dropListener;
            currentDropListener.onDragEnter(params);
            params.changed = true;
        }

        currentDropListener.onDragging(params);
    }

    public onDragStop(params: GridDraggingEvent): void {
        const currentDropListener = this.currentDropListener;
        if (currentDropListener) {
            currentDropListener.onDragStop(params);
            this.currentDropListener = null;
        }
    }

    public onDragCancel(): void {
        const currentDropListener = this.currentDropListener;
        if (currentDropListener) {
            currentDropListener.onDragCancel();
            this.currentDropListener = null;
        }
    }

    private getSection(draggingEvent: GridDraggingEvent): HorizontalSection {
        const pinnedSection = this.getPinnedSection(draggingEvent);

        switch (pinnedSection) {
            case 'left':
            case 'right':
                return pinnedSection;
            default:
                return 'center';
        }
    }

    private getDropListener(draggingEvent: GridDraggingEvent): DropListener {
        const section = this.getSection(draggingEvent);
        return this.isDropColumnInPivotMode(draggingEvent)
            ? this.bodyDropPivotTargets[section]
            : this.moveColumnFeatures[section];
    }

    private getPinnedSection(draggingEvent: GridDraggingEvent): ColumnPinnedType {
        const rect = this.eGridViewport.getBoundingClientRect();
        const x = draggingEvent.event.clientX - rect.left;
        const { visibleCols } = this.beans;
        const leftPinnedWidth = visibleCols.getLeftStickyColumnContainerWidth();
        const rightPinnedWidth = visibleCols.getRightStickyColumnContainerWidth();

        let section: ColumnPinnedType = null;
        if (x < leftPinnedWidth) {
            section = 'left';
        } else if (x > rect.width - rightPinnedWidth) {
            section = 'right';
        }

        // suppress oscillation from nudge-triggered re-detection
        const lastDetectedSection = this.lastDetectedSection;
        if (draggingEvent.fromNudge && section !== lastDetectedSection && lastDetectedSection !== null) {
            return lastDetectedSection;
        }

        this.lastDetectedSection = section;
        return section;
    }
}
