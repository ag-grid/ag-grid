import type {
    ChangedCellsPath,
    ChangedPath,
    ChangedRowsPath,
    IChangedPathFactory,
    IRowNode,
    NamedBean,
    RefreshModelParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { ChangedCellsPathImpl } from './changedCellsPath';
import { ChangedRowsPathImpl } from './changedRowsPath';

/**
 * Enterprise factory for creating `ChangedPath` instances used during incremental aggregation
 * and change detection. Registered as bean `changedPathFactory`.
 *
 * Community code accesses this via `beans.changedPathFactory?` — when enterprise modules are not
 * loaded, the factory is absent and callers fall back to full (non-incremental) processing.
 */
export class ChangedPathFactory extends BeanStub implements NamedBean, IChangedPathFactory {
    beanName = 'changedPathFactory' as const;

    /** {@inheritDoc IChangedPathFactory.newRowsPath} */
    public newRowsPath(): ChangedRowsPath {
        return new ChangedRowsPathImpl();
    }

    /** {@inheritDoc IChangedPathFactory.newCellsPath} */
    public newCellsPath(): ChangedCellsPath {
        return new ChangedCellsPathImpl();
    }

    /** {@inheritDoc IChangedPathFactory.newPath} */
    public newPath(trackCells: boolean): ChangedPath {
        return trackCells ? new ChangedCellsPathImpl() : new ChangedRowsPathImpl();
    }

    /** {@inheritDoc IChangedPathFactory.ensureRowsPath} */
    public ensureRowsPath(params: RefreshModelParams, rootNode: IRowNode | null | undefined): ChangedPath | undefined {
        let changedPath = params.changedPath;
        if (!changedPath && this.beans.rowModel.hierarchical && params.changedRowNodes && !params.newData) {
            changedPath = new ChangedRowsPathImpl();
            params.changedPath = changedPath;
            changedPath.addRow(rootNode);
        }
        return changedPath;
    }
}
