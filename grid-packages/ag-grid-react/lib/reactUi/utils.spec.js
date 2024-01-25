// ag-grid-react v31.0.3
/* import { describe, expect, xtest, test, jest, beforeEach, afterEach } from '@jest/globals';

import { getNextValueIfDifferent } from './utils';

const makeItem = (id: number) => ({ id, getInstanceId: () => id.toString() });
const toCompareStr = (arr: any[]) => arr.map(item => item.id).join(',');

describe('utils', () => {

    test('return prev ref if no difference ignoring order', () => {

        const prev = [1, 2, 3, 4, 5].map(makeItem);
        const next = [5, 3, 2, 1, 4].map(makeItem);

        const result = getNextValueIfDifferent(prev, next, false);
        expect(result).toBe(prev);

        const resultDomOrder = getNextValueIfDifferent(prev, next, true);
        expect(resultDomOrder).toBe(next);
    });


    test('maintain source order of prev when some old items and some new', () => {

        const prev = [1, 2, 3].map(makeItem);
        const next = [5, 3, 2, 1, 4].map(makeItem);

        const result = getNextValueIfDifferent(prev, next, false)!;
        expect(toCompareStr(result)).toEqual('1,2,3,5,4');

        const resultDomOrder = getNextValueIfDifferent(prev, next, true)!;
        // just return next
        expect(resultDomOrder).toBe(next);
    });

    test('maintain next ref when all new', () => {

        const prev = [1, 2, 3].map(makeItem);
        const next = [5, 4, 6].map(makeItem);

        const result = getNextValueIfDifferent(prev, next, false)!;
        expect(result).toBe(next);

        const resultDomOrder = getNextValueIfDifferent(prev, next, true)!;
        expect(resultDomOrder).toBe(next);
    });
});
   */ 
