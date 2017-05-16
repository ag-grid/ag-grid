import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {Utils as _} from '../utils';
import {GridCell} from "../entities/gridCell";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {RenderedCell} from "../rendering/renderedCell";

@Bean('mouseEventService')
export class MouseEventService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public getRenderedCellForEvent(event: MouseEvent | KeyboardEvent): RenderedCell {

        let sourceElement = _.getTarget(event);

        while (sourceElement) {
            let renderedCell = this.gridOptionsWrapper.getDomData(sourceElement, RenderedCell.DOM_DATA_KEY_RENDERED_CELL);
            if (renderedCell) {
                return <RenderedCell> renderedCell;
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
