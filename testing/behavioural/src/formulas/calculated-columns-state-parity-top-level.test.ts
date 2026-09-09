// The top-level half of the created/restored parity matrix; `calculated-columns-state-parity-grouped.test.ts`
// is the other. The matrix itself lives in the harness - only the anchor differs between the two.
import { describeCreatedRestoredParity, setupCalculatedColumnsStateSuite } from './calculatedColumnsStateHarness';

describe('calculated columns - grid state persistence', () => {
    setupCalculatedColumnsStateSuite();

    describeCreatedRestoredParity('at the top level', 'athlete');
});
