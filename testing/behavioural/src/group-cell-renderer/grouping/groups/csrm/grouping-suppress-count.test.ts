import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    getGridOptions_suppressCount,
    getTestConcerns_suppressCount,
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
    describe('with rowModelType=clientSide - autoColDef.cellRendererParams.suppressCount=true ', () => {
        createTests(getTestConcerns_suppressCount(gridOptions), getGridOptions_suppressCount(gridOptions));
    });
});
