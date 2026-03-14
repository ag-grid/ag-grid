import type { ChangedPath, IChangedPathFactory, NamedBean, RefreshModelParams } from 'ag-grid-community';
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

    /** {@inheritDoc IChangedPathFactory.newPath} */
    public newPath(trackCells: boolean): ChangedPath {
        return trackCells ? new ChangedCellsPathImpl() : new ChangedRowsPathImpl();
    }

    /** {@inheritDoc IChangedPathFactory.ensureRowsPath} */
    public ensureRowsPath(params: RefreshModelParams): ChangedPath | undefined {
        let changedPath = params.changedPath;
        if (!changedPath && params.changedRowNodes && !params.newData) {
            const rowModel = this.beans.rowModel;
            if (rowModel.hierarchical) {
                changedPath = new ChangedRowsPathImpl();
                params.changedPath = changedPath;
                changedPath.addRow(rowModel.rootNode);
            }
        }
        return changedPath;
    }
}
