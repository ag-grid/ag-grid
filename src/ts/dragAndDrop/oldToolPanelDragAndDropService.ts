import {Utils as _} from '../utils';
import {Logger, LoggerFactory} from "../logger";
import {Bean, PreDestroy} from "../context/context";
import {Qualifier} from "../context/context";

/** Functionality for internal DnD functionality between GUI widgets. Eg this service is used to drag columns
 * from the 'available columns' list and putting them into the 'grouped columns' in the tool panel.
 * This service is NOT used by the column headers for resizing and moving, that is a different use case. */
@Bean('oldToolPanelDragAndDropService')
export class OldToolPanelDragAndDropService {

    private dragItem: any;
    private mouseUpEventListener: EventListener;
    private logger: Logger;
    private destroyFunctions: Function[] = [];

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');

        // need to clean this up, add to 'finished' logic in grid
        var mouseUpListener = this.stopDragging.bind(this);
        document.addEventListener('mouseup', mouseUpListener);
        this.destroyFunctions.push( () => { document.removeEventListener('mouseup', mouseUpListener); } );
    }

    @PreDestroy
    private destroy(): void {
        this.destroyFunctions.forEach( func => func() );
        document.removeEventListener('mouseup', this.mouseUpEventListener);
    }

    private stopDragging() {
        if (this.dragItem) {
            this.setDragCssClasses(this.dragItem.eDragSource, false);
            this.dragItem = null;
        }
    }

    private setDragCssClasses(eListItem: any, dragging: any) {
        _.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
        _.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
    }

    public addDragSource(eDragSource: any, dragSourceCallback: any) {

        this.setDragCssClasses(eDragSource, false);

        eDragSource.addEventListener('mousedown',
            this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
    }

    private onMouseDownDragSource(eDragSource: any, dragSourceCallback: any) {
        if (this.dragItem) {
            this.stopDragging();
        }
        var data: any;
        if (dragSourceCallback.getData) {
            data = dragSourceCallback.getData();
        }
        var containerId: any;
        if (dragSourceCallback.getContainerId) {
            containerId = dragSourceCallback.getContainerId();
        }

        this.dragItem = {
            eDragSource: eDragSource,
            data: data,
            containerId: containerId
        };
        this.setDragCssClasses(this.dragItem.eDragSource, true);
    }

    public addDropTarget(eDropTarget: any, dropTargetCallback: any) {
        var mouseIn = false;
        var acceptDrag = false;

        eDropTarget.addEventListener('mouseover', () => {
            if (!mouseIn) {
                mouseIn = true;
                if (this.dragItem) {
                    acceptDrag = dropTargetCallback.acceptDrag(this.dragItem);
                } else {
                    acceptDrag = false;
                }
            }
        });

        eDropTarget.addEventListener('mouseout', () => {
            if (acceptDrag) {
                dropTargetCallback.noDrop();
            }
            mouseIn = false;
            acceptDrag = false;
        });

        eDropTarget.addEventListener('mouseup', () => {
            // dragItem should never be null, checking just in case
            if (acceptDrag && this.dragItem) {
                dropTargetCallback.drop(this.dragItem);
            }
        });

    }

}