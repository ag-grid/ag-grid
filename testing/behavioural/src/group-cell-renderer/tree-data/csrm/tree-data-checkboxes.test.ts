import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../test-utils';
import { getTestGenerator } from '../../util';
import { rowModelGridOptions } from '../grid-config';
import { getGridOptions_checkboxes, getTestConcerns_checkboxes, treeDataSnapshotter } from '../tree-data-test-utils';

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

    const gridOptions = rowModelGridOptions.csrm;
    describe('with rowModelType=clientSide - checkboxes', () => {
        createTests(getTestConcerns_checkboxes(), getGridOptions_checkboxes(gridOptions));
    });
});
