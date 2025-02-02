import type { AgColumn } from '../entities/agColumn';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface IRowHeaderColsService extends IColumnCollectionService {
    setupHeader(eGui: HTMLElement, column: AgColumn): void;
}
