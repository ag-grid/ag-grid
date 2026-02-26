import { CellStyleModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import { getGridOptions_checkboxes, getTestConcerns_checkboxes, groupCellSnapshotter } from '../../grouping-test-utils';

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
    describe('with rowModelType=serverSide - checkboxes', () => {
        createTests(getTestConcerns_checkboxes(gridOptions), getGridOptions_checkboxes(gridOptions));
    });
});
