// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from '../gridOptionsWrapper';
import SelectionRendererFactory from '../selectionRendererFactory';
import ExpressionService from '../expressionService';
import EventService from '../eventService';
export default function groupCellRendererFactory(gridOptionsWrapper: GridOptionsWrapper, selectionRendererFactory: SelectionRendererFactory, expressionService: ExpressionService, eventService: EventService): (params: any) => HTMLSpanElement;
