import { CellStyleModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    getGridOptions_correctValue_defaultRenderer,
    getTestConcerns_correctValue,
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
    describe('with rowModelType=serverSide - correct values are displayed - with default renderer', () => {
        createTests(
            getTestConcerns_correctValue(gridOptions),
            getGridOptions_correctValue_defaultRenderer(gridOptions)
        );
    });
});
