import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    findSnapshotter,
    getGridOptions_correctRenderer,
    getTestConcerns_correctRenderer,
} from '../../grouping-test-utils';

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
    describe('with rowModelType=clientSide - correct renderer is used', () => {
        // Find doesn't support groupRows, so exclude it
        createTests(getTestConcerns_correctRenderer(gridOptions, false), getGridOptions_correctRenderer(gridOptions));
    });
});
