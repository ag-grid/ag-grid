import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../test-utils';
import { getTestGenerator } from '../../util';
import { rowModelGridOptions } from '../grid-config';
import {
    getGridOptions_correctValue_defaultRenderer,
    getTestConcerns_correctValue,
    treeDataSnapshotter,
} from '../tree-data-test-utils';

describe('ag-grid tree data groupCellRenderer', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });
    const createTests = getTestGenerator(gridsManager, treeDataSnapshotter);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const gridOptions = rowModelGridOptions.ssrm;
    describe('with rowModelType=serverSide - correct values are displayed - default renderer', () => {
        createTests(getTestConcerns_correctValue(), getGridOptions_correctValue_defaultRenderer(gridOptions));
    });
});
