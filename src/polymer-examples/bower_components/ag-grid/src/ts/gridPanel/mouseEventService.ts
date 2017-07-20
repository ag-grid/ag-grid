import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {Utils as _} from '../utils';
import {GridCell} from "../entities/gridCell";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {CellComp} from "../rendering/cellComp";

@Bean('mouseEventService')
export class MouseEventService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public getRenderedCellForEvent(event: MouseEvent | KeyboardEvent): CellComp {

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

    public getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell {
        let renderedCell = this.getRenderedCellForEvent(event);
        return renderedCell ? renderedCell.getGridCell() : null;
    }

}
