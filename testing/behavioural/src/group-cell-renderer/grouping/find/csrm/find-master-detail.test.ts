import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import { findSnapshotter, getGridOptions_masterDetail, getTestConcerns_masterDetail } from '../../grouping-test-utils';

describe('ag-grid find API', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const createTests = getTestGenerator(gridsManager, findSnapshotter);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const gridOptions = rowModelGridOptions.csrm;
    describe('with rowModelType=clientSide - master detail', () => {
        createTests(getTestConcerns_masterDetail(gridOptions), getGridOptions_masterDetail(gridOptions));
    });
});
