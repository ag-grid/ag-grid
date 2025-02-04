import type { HeaderComp } from '../headerRendering/cells/column/headerComp';
import type { CellPosition } from './iCellPosition';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface IRowHeaderColsService extends IColumnCollectionService {
    setupForHeader(comp: HeaderComp): void;
    handleMouseDownOnCell(cell: CellPosition, mouseEvent: MouseEvent): boolean;
}
