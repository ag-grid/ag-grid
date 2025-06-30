import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import {
    findSnapshotter,
    getGridOptions_correctValue_colDefInnerRendererGroupCol,
    getTestConcerns_correctValue,
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
    describe('with rowModelType=clientSide - correct values are displayed - colDef inner renderer on group column', () => {
        // Find doesn't support groupRows, so exclude it
        createTests(
            getTestConcerns_correctValue(gridOptions, false),
            getGridOptions_correctValue_colDefInnerRendererGroupCol(gridOptions)
        );
    });
});
