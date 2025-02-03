import type { AgColumn } from '../entities/agColumn';
import type { CellPosition } from './iCellPosition';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface IRowHeaderColsService extends IColumnCollectionService {
    setupHeader(eGui: HTMLElement, column: AgColumn): void;
    handleMouseDownOnCell(cell: CellPosition, mouseEvent: MouseEvent): boolean;
}
