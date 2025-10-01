import type { GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../../../test-utils';
import { getTestGenerator } from '../../../util';
import { rowModelGridOptions } from '../../grid-config';
import { getExportedTestConcerns } from '../exported-test-utils';

describe('ag-grid exported group values', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });
    const snapshotCsv = (container: HTMLDivElement, api: GridApi) => {
        return api.getDataAsCsv();
    };
    const createTests = getTestGenerator(gridsManager, snapshotCsv);

    beforeEach(() => {
        gridsManager.reset();
        vi.useFakeTimers();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.useFakeTimers();
    });

    // special case, include extra empty column to export the group row
    describe('with rowModelType=clientSide, groupDisplayType=groupRows', () => {
        const gridOptions = rowModelGridOptions.csrm;
        const testConcerns = getExportedTestConcerns().filter((x) => x.property !== 'groupDisplayType');
        createTests(testConcerns, {
            ...gridOptions,
            groupDisplayType: 'groupRows',
            columnDefs: [...gridOptions.columnDefs!, {}],
        });
    });
});
