// The grouped half of the created/restored parity matrix; `calculated-columns-state-parity-top-level.test.ts`
// is the other. `gold` sits in the Medals group, so restoring it resolves its anchor through `parentGroupId`
// rather than as a top-level leaf - a different code path, hence a file each rather than one longer suite.
import { describeCreatedRestoredParity, setupCalculatedColumnsStateSuite } from './calculatedColumnsStateHarness';

describe('calculated columns - grid state persistence', () => {
    setupCalculatedColumnsStateSuite();

    describeCreatedRestoredParity('inside a column group', 'gold');
});
