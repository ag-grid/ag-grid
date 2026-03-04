import { CellStyleModule } from 'ag-grid-community';
import { FindModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import { findSnapshotter, getGridOptions_pivot, getTestConcerns_pivot } from '../../grouping-test-utils';

describe('ag-grid find API', () => {
    const gridsManager = new TestGridsManager({
        modules: [FindModule, PivotModule, RowGroupingModule, CellStyleModule],
    });
    const createTests = getTestGenerator(gridsManager, findSnapshotter);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const gridOptions = rowModelGridOptions.csrm;
    describe('with rowModelType=clientSide - pivot mode', () => {
        createTests(getTestConcerns_pivot(gridOptions), getGridOptions_pivot(gridOptions));
    });
});
