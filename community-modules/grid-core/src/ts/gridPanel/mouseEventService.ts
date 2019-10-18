import { Bean, PostConstruct } from "../context/context";
import { Autowired } from "../context/context";
import { CellPosition } from "../entities/cellPosition";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { CellComp } from "../rendering/cellComp";
import { NumberSequence, _ } from '../utils';

@Bean('mouseEventService')
export class MouseEventService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private static gridInstanceSequence = new NumberSequence();
    private static GRID_DOM_KEY = '__ag_grid_instance';

    private gridInstanceId = MouseEventService.gridInstanceSequence.next();

    @PostConstruct
    private init(): void {
        this.stampDomElementWithGridInstance();
    }

    // we put the instance id onto the main DOM element. this is used for events, when grids are inside grids,
    // so the grid can work out if the even came from this grid or a grid inside this one. see the ctrl+v logic
    // for where this is used.
    private stampDomElementWithGridInstance(): void {
        (this.eGridDiv as any)[MouseEventService.GRID_DOM_KEY] = this.gridInstanceId;
    }

    public getRenderedCellForEvent(event: Event): CellComp {
        return _.getCellCompForEvent(this.gridOptionsWrapper, event);
    }

    // walks the path of the event, and returns true if this grid is the first one that it finds. if doing
    // master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
    // getting executed on many grids at the same time.
    public isEventFromThisGrid(event: MouseEvent | KeyboardEvent): boolean {

        const path = _.getEventPath(event);

        for (let i = 0; i < path.length; i++) {
            const element = path[i];
            const instanceId = (element as any)[MouseEventService.GRID_DOM_KEY];
            if (_.exists(instanceId)) {
                const eventFromThisGrid = instanceId === this.gridInstanceId;
                return eventFromThisGrid;
            }
        }

        return false;
    }

    public getCellPositionForEvent(event: MouseEvent | KeyboardEvent): CellPosition {
        const cellComp = this.getRenderedCellForEvent(event);
        return cellComp ? cellComp.getCellPosition() : null;
    }

}
