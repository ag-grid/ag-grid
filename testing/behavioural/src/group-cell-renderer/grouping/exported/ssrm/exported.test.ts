import type { GridApi } from 'ag-grid-community';
import { CellStyleModule, CsvExportModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import { getExportedTestConcerns } from '../exported-test-utils';

describe('ag-grid exported group values', () => {
    const gridsManager = new TestGridsManager({
        modules: [CellStyleModule, CsvExportModule, PivotModule, RowGroupingModule, ServerSideRowModelModule],
    });
    const snapshotCsv = (container: HTMLDivElement, api: GridApi) => {
        return api.getDataAsCsv();
    };
    const createTests = getTestGenerator(gridsManager, snapshotCsv);

    beforeEach(() => {
        gridsManager.reset();
        vi.useFakeTimers();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.useFakeTimers();
    });

    describe('with rowModelType=clientSide', () => {
        const gridOptions = rowModelGridOptions.csrm;
        const testConcerns = getExportedTestConcerns();
        createTests(testConcerns, { ...gridOptions });
    });
});
