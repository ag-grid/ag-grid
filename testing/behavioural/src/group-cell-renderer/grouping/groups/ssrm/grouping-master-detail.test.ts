import { CellStyleModule } from 'ag-grid-community';
import { MasterDetailModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    getGridOptions_masterDetail,
    getTestConcerns_masterDetail,
    groupCellSnapshotter,
} from '../../grouping-test-utils';

describe('ag-grid groupCellRenderer', () => {
    const gridsManager = new TestGridsManager({
        modules: [CellStyleModule, MasterDetailModule, RowGroupingModule, ServerSideRowModelModule],
    });
    const createTests = getTestGenerator(gridsManager, groupCellSnapshotter);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const gridOptions = rowModelGridOptions.ssrm;
    describe('with rowModelType=serverSide - with master detail', () => {
        createTests(getTestConcerns_masterDetail(gridOptions), getGridOptions_masterDetail(gridOptions));
    });
});
