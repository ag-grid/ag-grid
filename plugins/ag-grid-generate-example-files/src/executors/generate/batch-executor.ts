import { batchWorkerExecutor } from 'ag-shared/plugin-utils';
import { versions } from 'process';

import { readGridOptionsType } from '../../../gridOptionsTypes/gridOptionsTypesFile';

if (versions.node < '18.18') {
    throw new Error('Upgrade Node.js to v18.18.0 for multi-threaded thumbnail generation; found: ' + versions.node);
}
const executor = batchWorkerExecutor(`${module.path}/batch-instance.js`, () => ({
    gridOptionsTypes: readGridOptionsType(),
}));

export default executor;
