import { CellStyleModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    getGridOptions_suppressCount,
    getTestConcerns_suppressCount,
    groupCellSnapshotter,
} from '../../grouping-test-utils';

describe('ag-grid groupCellRenderer', () => {
    const gridsManager = new TestGridsManager({
        modules: [CellStyleModule, RowGroupingModule, ServerSideRowModelModule],
    });
    const createTests = getTestGenerator(gridsManager, groupCellSnapshotter);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const gridOptions = rowModelGridOptions.ssrm;
    describe('with rowModelType=serverSide - autoColDef.cellRendererParams.suppressCount=true ', () => {
        createTests(getTestConcerns_suppressCount(gridOptions), getGridOptions_suppressCount(gridOptions));
    });
});
