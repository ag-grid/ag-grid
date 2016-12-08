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
        var domDataKey = this.gridOptionsWrapper.getDomDataKey();
        var sourceElement = _.getTarget(event);

        while (sourceElement) {
            var domData = (<any>sourceElement)[domDataKey];
            if (domData && domData.renderedCell) {
                let renderedCell = <RenderedCell> domData.renderedCell;
                return renderedCell;
            }
            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    public getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell {
        var renderedCell = this.getRenderedCellForEvent(event);
        return renderedCell ? renderedCell.getGridCell() : null;
    }

}
