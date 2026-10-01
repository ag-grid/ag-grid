import type { GridOptions } from '../entities/gridOptions';
import type { IsServerSideGroupOpenByDefaultParams } from './iCallbackParams';

interface ICar {
    make: string;
    model: string;
    price: number;
}

/**
 * AG-18477: the row-data generic supplied to `GridOptions<TData>` must reach the
 * `isServerSideGroupOpenByDefault` callback, so that `params.data` and `params.rowNode.data` are
 * typed as the row-data interface and off-interface property access is a compile error — as it
 * already is for `getRowId` and `isGroupOpenByDefault`.
 *
 * This is a compile-time assertion: the `@ts-expect-error` directives below are what make it fail
 * while `data` is typed `any` (an unused directive is `TS2578`), because `any` satisfies every
 * positive assertion identically before and after the fix.
 */
describe('IsServerSideGroupOpenByDefaultParams', () => {
    test('threads the GridOptions row-data generic through params.data and params.rowNode', () => {
        const isServerSideGroupOpenByDefault: GridOptions<ICar>['isServerSideGroupOpenByDefault'] = (params) => {
            const make: string = params.data.make;
            const rowNodeMake: string | undefined = params.rowNode.data?.make;

            // @ts-expect-error notAProperty does not exist on the supplied row-data type
            const notAProperty = params.data.notAProperty;
            // @ts-expect-error notAProperty does not exist on the supplied row-data type
            const notOnRowNode = params.rowNode.data?.notAProperty;

            return make === 'Ford' && rowNodeMake === 'Ford' && !notAProperty && !notOnRowNode;
        };

        const car: ICar = { make: 'Ford', model: 'Focus', price: 1 };
        const params = { data: car, rowNode: { data: car } } as unknown as IsServerSideGroupOpenByDefaultParams<ICar>;

        expect(isServerSideGroupOpenByDefault!(params)).toBe(true);
    });
});
