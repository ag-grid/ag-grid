import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {Utils as _} from '../utils';
import {GridCell} from "../entities/gridCell";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {CellComp, ICellComp} from "../rendering/cellComp";
import {SlickCellComp} from "../rendering/slickCellComp";

@Bean('mouseEventService')
export class MouseEventService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public getRenderedCellForEvent(event: MouseEvent | KeyboardEvent): ICellComp {

        let sourceElement = _.getTarget(event);

        while (sourceElement) {
            let renderedCell = this.gridOptionsWrapper.getDomData(sourceElement, SlickCellComp.DOM_DATA_KEY_CELL_COMP);
            if (renderedCell) {
                return <CellComp> renderedCell;
            }
            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    public getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell {
        let cellComp = this.getRenderedCellForEvent(event);
        return cellComp ? cellComp.getGridCell() : null;
    }

}
