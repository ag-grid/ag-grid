import type { ColDef, GridApi, GridOptions, RowSelectionOptions } from 'ag-grid-community';

import type { TestGridsManager } from '../../test-utils';

interface GridOptionTestPermutation<T extends keyof GridOptions> {
    condition?: (gridOptions: GridOptions) => boolean;
    property: T;
    values: GridOptions[T][];
}
interface ColDefTestPermutation<T extends keyof ColDef> {
    condition?: (gridOptions: GridOptions) => boolean;
    property: `colDef[${number}].${T}` | `autoGroupColumnDef.${T}`;
    values: ColDef[T][];
    setter: (gridOptions: GridOptions, value: any) => void;
}
interface RowSelectionTestPermutation<T extends keyof RowSelectionOptions> {
    condition?: (gridOptions: GridOptions) => boolean;
    property: `rowSelection.${T}`;
    values: RowSelectionOptions[T][];
    setter: (gridOptions: GridOptions, value: any) => void;
}
type DistributeGridOptionArrayOverUnions<T extends keyof GridOptions> = T extends any
    ? GridOptionTestPermutation<T>
    : never;
type DistributeColDefArrayOverUnions<T extends keyof ColDef> = T extends any ? ColDefTestPermutation<T> : never;
type DistributeRowSelectionOptionsArrayOverUnions<T extends keyof RowSelectionOptions> = T extends any
    ? RowSelectionTestPermutation<T>
    : never;
// this could be reduced but typescript doesn't do higher kinded types
export type TestPermutation =
    | DistributeGridOptionArrayOverUnions<keyof GridOptions>
    | DistributeColDefArrayOverUnions<keyof ColDef>
    | DistributeRowSelectionOptionsArrayOverUnions<keyof RowSelectionOptions>;

export const getTestGenerator =
    (gridManager: TestGridsManager, getSnapshot: (container: HTMLDivElement, api: GridApi) => any) =>
    (tests: TestPermutation[], prevGridOptions: GridOptions) => {
        return generateTestsRecursively(gridManager, getSnapshot, tests, prevGridOptions, 0);
    };

const generateTestsRecursively = (
    gridManager: TestGridsManager,
    getSnapshot: (container: HTMLDivElement, api: GridApi) => any,
    tests: TestPermutation[],
    prevGridOptions: GridOptions,
    idx: number
): boolean => {
    const nextTest = tests[idx];
    if (!nextTest) {
        return false;
    }

    const gridOptions = { ...prevGridOptions };
    const { condition, property, values } = nextTest;
    if (condition && !condition(gridOptions)) {
        if (idx === tests.length - 1) {
            return false;
        }
        return generateTestsRecursively(gridManager, getSnapshot, tests, gridOptions, idx + 1);
    }

    if (idx === tests.length - 1) {
        test.each(values)(`${property}=%s`, (value) => {
            if ('setter' in nextTest) {
                nextTest.setter(gridOptions, value);
            } else {
                gridOptions[property] = value;
            }

            // for snapshots, the grid uses innerText which is not supported by jsom; so we need to polyfill it
            // with innerText instead
            if (!('innerText' in Element.prototype)) {
                Object.defineProperty(Element.prototype, 'innerText', {
                    set(value) {
                        this.textContent = value;
                    },
                });
            }

            const div = document.createElement('div');
            // use fake timers when creating the grid; as the grid uses a lot of setTimeout
            // and we want to wait for all of them to finish
            vi.useFakeTimers();
            const api = gridManager.createGrid(div, gridOptions);
            vi.runAllTimers();
            vi.useRealTimers();
            const snapshot = getSnapshot(div, api);
            expect(snapshot).toMatchSnapshot();
        });
        return true;
    }

    describe.each(values)(`${property}=%s`, (value) => {
        if ('setter' in nextTest) {
            nextTest.setter(gridOptions, value);
        } else {
            gridOptions[property] = value;
        }
        // if no more tests after this, we need to make a test instead of describe.
        if (!generateTestsRecursively(gridManager, getSnapshot, tests, gridOptions, idx + 1)) {
            test('snapshot', () => {
                // for snapshots, the grid uses innerText which is not supported by jsom; so we need to polyfill it
                // with innerText instead
                if (!('innerText' in Element.prototype)) {
                    Object.defineProperty(Element.prototype, 'innerText', {
                        set(value) {
                            this.textContent = value;
                        },
                    });
                }

                const div = document.createElement('div');
                // use fake timers when creating the grid; as the grid uses a lot of setTimeout
                // and we want to wait for all of them to finish
                vi.useFakeTimers();
                const api = gridManager.createGrid(div, gridOptions);
                vi.runAllTimers();
                vi.useRealTimers();
                const snapshot = getSnapshot(div, api);
                expect(snapshot).toMatchSnapshot();
            });
        }
    });
    return true;
};
