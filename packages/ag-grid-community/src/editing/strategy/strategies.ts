import type { EditStrategyType, IEditStrategy } from '../../interfaces/editStrategy';
import { BatchEditStrategy } from './batchEditStrategy';
import { FullRowEditStrategy } from './fullRowEditStrategy';
import { SingleCellEditStrategy } from './singleCellEditStrategy';

export const EditStrategyMap: Record<EditStrategyType, IEditStrategy> = {
    cell: SingleCellEditStrategy,
    row: FullRowEditStrategy,
    batch: BatchEditStrategy,
};
