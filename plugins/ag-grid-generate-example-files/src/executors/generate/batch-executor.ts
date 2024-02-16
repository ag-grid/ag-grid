import { batchExecutor } from '../../executors-utils';
import { generateFiles } from './executor';

const executor = batchExecutor(generateFiles);

export default executor;
