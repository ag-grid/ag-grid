import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    getGridOptions_correctValue_innerRenderer,
    getTestConcerns_correctValue,
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
    describe('with rowModelType=clientSide - correct values are displayed - with an autoColDef.cellRenderer.innerRenderer', () => {
        createTests(getTestConcerns_correctValue(gridOptions), getGridOptions_correctValue_innerRenderer(gridOptions));
    });
});
