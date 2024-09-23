import type { RowNode } from '../entities/rowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { Column } from './iColumn';
import type { IRowNode } from './iRowNode';

export interface IGroupHideOpenParentsService {
    updateGroupDataForHideOpenParents(changedPath?: ChangedPath): void;

    pullDownGroupDataForHideOpenParents(rowNodes: RowNode[] | null, clearOperation: boolean): void;

    isShowingValueForOpenedParent(rowNode: IRowNode, column: Column): boolean;
}
