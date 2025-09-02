import { BaseDragService } from '../agStack/core/baseDragService';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';

/** Adds drag listening onto an element. In AG Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
export class DragService extends BaseDragService<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService
> {
    protected override shouldPreventMouseEvent(mouseEvent: MouseEvent): boolean {
        const isEnableCellTextSelect = this.gos.get('enableCellTextSelection');
        // when `isEnableCellTextSelect` is `true`, we need to preventDefault on mouseMove
        // to avoid the grid text being selected while dragging components.
        return isEnableCellTextSelect && super.shouldPreventMouseEvent(mouseEvent);
    }
}
