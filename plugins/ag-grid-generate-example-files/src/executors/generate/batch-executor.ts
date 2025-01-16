import { batchExecutor } from 'ag-shared/plugin-utils';

import { generateFiles } from './executor';

const executor = batchExecutor(generateFiles);

export default executor;
