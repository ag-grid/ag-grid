import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    getGridOptions_masterDetail,
    getTestConcerns_masterDetail,
    groupCellSnapshotter,
} from '../../grouping-test-utils';

describe('ag-grid groupCellRenderer', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const createTests = getTestGenerator(gridsManager, groupCellSnapshotter);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const gridOptions = rowModelGridOptions.csrm;
    describe('with rowModelType=clientSide - with master detail', () => {
        createTests(getTestConcerns_masterDetail(gridOptions), getGridOptions_masterDetail(gridOptions));
    });
});
