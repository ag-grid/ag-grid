import {Bean, PostConstruct} from "../context/context";
import {Autowired} from "../context/context";
import {NumberSequence, Utils as _} from '../utils';
import {GridCell} from "../entities/gridCell";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {CellComp} from "../rendering/cellComp";

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
        (<any>this.eGridDiv)[MouseEventService.GRID_DOM_KEY] = this.gridInstanceId;
    }

    public getRenderedCellForEvent(event: Event): CellComp {

        let sourceElement = _.getTarget(event);

        while (sourceElement) {
            let renderedCell = this.gridOptionsWrapper.getDomData(sourceElement, CellComp.DOM_DATA_KEY_CELL_COMP);
            if (renderedCell) {
                return <CellComp> renderedCell;
            }
            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    // walks the path of the event, and returns true if this grid is the first one that it finds. if doing
    // master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
    // getting executed on many grids at the same time.
    public isEventFromThisGrid(event: MouseEvent | KeyboardEvent): boolean {

        let path = _.getEventPath(event);

        for (let i = 0; i<path.length; i++) {
            let element = path[i];
            let instanceId = (<any>element)[MouseEventService.GRID_DOM_KEY];
            if (_.exists(instanceId)) {
                let eventFromThisGrid = instanceId === this.gridInstanceId;
                return eventFromThisGrid;
            }
        }

        return false;
    }

    public getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell {
        let cellComp = this.getRenderedCellForEvent(event);
        return cellComp ? cellComp.getGridCell() : null;
    }

}
