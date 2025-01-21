import { batchWorkerExecutor } from 'ag-shared/plugin-utils';
import { versions } from 'process';

import { getGridOptionsType } from '../../../gridOptionsTypes/buildGridOptionsType';

if (versions.node < '18.18') {
    // eslint-disable-next-line no-console
    throw new Error('Upgrade Node.js to v18.18.0 for multi-threaded thumbnail generation; found: ' + versions.node);
}
const executor = batchWorkerExecutor(`${module.path}/batch-instance.js`, () => ({
    gridOptionsTypes: getGridOptionsType(),
}));

export default executor;
