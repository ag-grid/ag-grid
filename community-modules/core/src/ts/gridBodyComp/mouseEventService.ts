import { Bean } from "../context/context";
import { Autowired } from "../context/context";
import { CellPosition } from "../entities/cellPosition";
import { NumberSequence } from '../utils';
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
import { BeanStub } from "../context/beanStub";
import { getCtrlForEvent } from "../utils/event";
import { exists } from "../utils/generic";
import { CtrlsService } from "../ctrlsService";
import { CellCtrl } from "../rendering/cell/cellCtrl";

@Bean('mouseEventService')
export class MouseEventService extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private static gridInstanceSequence = new NumberSequence();
    private static GRID_DOM_KEY = '__ag_grid_instance';

    private gridInstanceId = MouseEventService.gridInstanceSequence.next();

    // we put the instance id onto the main DOM element. this is used for events, when grids are inside grids,
    // so the grid can work out if the even came from this grid or a grid inside this one. see the ctrl+v logic
    // for where this is used.
    public stampTopLevelGridCompWithGridInstance(eGridDiv: HTMLElement): void {
        (eGridDiv as any)[MouseEventService.GRID_DOM_KEY] = this.gridInstanceId;
    }

    public getRenderedCellForEvent(event: Event): CellCtrl | null {
        return getCtrlForEvent<CellCtrl>(this.gridOptionsService, event, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
    }

    // walks the path of the event, and returns true if this grid is the first one that it finds. if doing
    // master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
    // getting executed on many grids at the same time.
    public isEventFromThisGrid(event: UIEvent): boolean {
        const res = this.isElementInThisGrid(event.target as HTMLElement);
        return res;
    }

    public isElementInThisGrid(element: HTMLElement): boolean {
        let pointer: HTMLElement | null = element;
        while (pointer) {
            const instanceId = (pointer as any)[MouseEventService.GRID_DOM_KEY];
            if (exists(instanceId)) {
                const eventFromThisGrid = instanceId === this.gridInstanceId;
                return eventFromThisGrid;
            }
            pointer = pointer.parentElement;
        }
        return false;
    }

    public getCellPositionForEvent(event: MouseEvent | KeyboardEvent): CellPosition | null {
        const cellComp = this.getRenderedCellForEvent(event);
        return cellComp ? cellComp.getCellPosition() : null;
    }

    public getNormalisedPosition(event: MouseEvent | DraggingEvent): { x: number, y: number; } {
        const gridPanelHasScrolls = this.gridOptionsService.isDomLayout('normal');
        const e = event as MouseEvent;
        let x: number;
        let y: number;

        if (e.clientX != null || e.clientY != null) {
            x = e.clientX;
            y = e.clientY;
        } else {
            x = e.x;
            y = e.y;
        }

        if (gridPanelHasScrolls) {
            const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
            const vRange = gridBodyCon.getScrollFeature().getVScrollPosition();
            const hRange = gridBodyCon.getScrollFeature().getHScrollPosition();
            x += hRange.left;
            y += vRange.top;
        }

        return { x, y };
    }

}
